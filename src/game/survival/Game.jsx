
import React, { useRef, useEffect, useState, useCallback } from 'react';
import UI from './setting/UI.jsx';
import PlayerSetting from './setting/PlayerSetting.jsx';
import GameEngine from './systems/GameEngine.jsx';
import { ArrowPad, Joystick } from './systems/GameControl.jsx';
import { useGameStart } from '../../hooks/useGameStart.jsx';
import { useGameScorePost } from '../../hooks/useGameScorePost.jsx';

const Game = () => {
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  const [gameState, setGameState] = useState('menu');

  // 간단한 화면 회전 감지
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  const [gameStats, setGameStats] = useState({
    level: 1,
    kills: 0,
    time: 0,
    hp: 100,
    maxHp: 100,
    exp: 0,
    maxExp: 50
  });

  const { startGame: apiStartGame, loading: startLoading, error: startError } = useGameStart();
  const { postGameScore, loading: scoreLoading, error: scoreError } = useGameScorePost();

  // 화면 회전 감지 (모바일 최적화)
  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      const isLandscapeByWindow = width > height;

      let isLandscapeByOrientation = false;
      if (screen.orientation) {
        isLandscapeByOrientation = screen.orientation.angle === 90 || screen.orientation.angle === -90;
      } else if (window.orientation !== undefined) {
        isLandscapeByOrientation = Math.abs(window.orientation) === 90;
      }

      let newIsLandscape;
      if (screen.orientation || window.orientation !== undefined) {
        newIsLandscape = isLandscapeByOrientation;
      } else {
        newIsLandscape = isLandscapeByWindow;
      }

      setIsLandscape(newIsLandscape);
    };

    checkOrientation();

    const handleResize = () => {
      setTimeout(checkOrientation, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    if (screen.orientation && screen.orientation.addEventListener) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (screen.orientation && screen.orientation.removeEventListener) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  // React state 완전히 무시하고 게임 엔진 플래그만 사용하여 클로저 문제 완전 해결
  const handleStateChange = useCallback(async (newState) => {
    const isTestMode = gameEngineRef.current?.isTestMode === true;
    
    console.log('State change:', newState, 'Engine test mode:', isTestMode);

    setGameState(newState);

    if (newState === 'gameover') {
      console.log('Game over detected - engine test mode:', isTestMode);
      
      if (isTestMode) {
        console.log('🚫 TEST MODE - No score saved');
        return;
      }
      
      // 테스트 모드가 아닐 때만 점수 저장
      console.log('Normal mode - attempting to save score');
      const finalStats = gameEngineRef.current?.getFinalStats();
      if (finalStats && (finalStats.kills > 0 || finalStats.level > 1 || finalStats.time > 5)) {
        console.log('Saving score for normal mode:', finalStats);
        try {
          await postGameScore(finalStats.kills, finalStats.level);
          console.log('Score saved successfully');
        } catch (error) {
          console.error('Failed to save score:', error);
        }
      } else {
        console.log('No valid stats to save (too short game)');
      }
    }
  }, [postGameScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gameEngine = new GameEngine(canvas, {
      onStateChange: handleStateChange,
      onStatsUpdate: setGameStats
    });

    gameEngineRef.current = gameEngine;
    gameEngine.init();

    return () => {
      gameEngine.destroy();
    };
  }, []);

  const startGame = async () => {
    try {
      console.log('Starting normal game...');
      
      // 게임 엔진에 명시적으로 normal 모드 설정
      if (gameEngineRef.current) {
        gameEngineRef.current.isTestMode = false;
      }

      const gameSession = await apiStartGame();
      if (gameSession) {
        console.log('Game session created, starting game engine');
        gameEngineRef.current?.startGame();
      } else {
        console.error('Failed to create game session');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const startTestGame = () => {
    console.log('Starting test game...');
    
    // 게임 엔진에 명시적으로 test 모드 설정
    if (gameEngineRef.current) {
      gameEngineRef.current.isTestMode = true;
      console.log('Test mode flag set, starting game...');
      gameEngineRef.current.startGame();
    } else {
      console.error('Game engine not initialized!');
    }
  };

  const restartGame = () => {
    console.log('Restarting game...');
    setGameState('menu');

    setGameStats({
      level: 1,
      kills: 0,
      time: 0,
      hp: 100,
      maxHp: 100,
      exp: 0,
      maxExp: 50
    });

    if (gameEngineRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const gameEngine = new GameEngine(canvas, {
          onStateChange: handleStateChange,
          onStatsUpdate: setGameStats
        });
        gameEngineRef.current = gameEngine;
        gameEngine.init();
      }
    }
  };

  const pauseGame = () => {
    gameEngineRef.current?.pauseGame();
  };

  const resumeGame = () => {
    gameEngineRef.current?.resumeGame();
  };

  const levelUp = () => {
    gameEngineRef.current?.levelUp();
  };

  const [showPlayerSettings, setShowPlayerSettings] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-purple-600 to-purple-800 overflow-hidden">

      {/* 게임 컨테이너 */}
      <div
        className={`relative w-full ${isLandscape ? 'h-full flex flex-row' : 'flex flex-col'} px-2 md:px-6`}
        style={{
          marginTop: isLandscape ? '0.5rem' : '0.5rem',
          marginBottom: isLandscape ? '8rem' : '8rem',
        }}
      >
        {/* 가로 모드일 때 왼쪽 사이드바 */}
        {isLandscape && (
          <div className="flex flex-col gap-2 w-36 p-4 bg-black/30 rounded-lg">
            <div className="bg-black/70 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Kills:</span>
                  <span className="text-white font-bold">{gameStats.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Level:</span>
                  <span className="text-white font-bold">{gameStats.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Time:</span>
                  <span className="text-white font-bold">{formatTime(gameStats.time)}</span>
                </div>
                {gameEngineRef.current?.isTestMode && (
                  <div className="text-yellow-400 text-xs mt-2">TEST MODE</div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowPlayerSettings(true)}
              className="p-3 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
              aria-label="settings"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        )}

        {/* 상단 정보바 (세로 모드만) */}
        {!isLandscape && (
          <div className="flex justify-between items-center w-full px-4 py-2 bg-black/70 rounded-xl mx-auto max-w-4xl mb-2">
            {gameState === 'playing' ? (
              <div className="flex gap-4 md:gap-8 text-sm md:text-lg font-bold text-white">
                <div>Kills: {gameStats.kills}</div>
                <div>Level: {gameStats.level}</div>
                <div>{formatTime(gameStats.time)}</div>
                {gameEngineRef.current?.isTestMode && (
                  <div className="text-yellow-400">TEST</div>
                )}
              </div>
            ) : (
              <div className="flex gap-4 md:gap-8 text-sm md:text-lg font-bold text-white/50">
                <div>Kills: --</div>
                <div>Level: --</div>
                <div>Time: --:--</div>
              </div>
            )}

            <button
              onClick={() => setShowPlayerSettings(true)}
              className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors text-base"
              aria-label="settings"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        )}

        {/* 중앙 게임 디스플레이 */}
        <div className={`flex justify-center ${isLandscape ? 'flex-1' : 'mb-2'}`}>
          <div
            className="relative bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden"
            style={{
              width: isLandscape ? 'auto' : '100%',
              height: isLandscape ? 'calc(100vh - 1rem)' : 'auto',
              maxWidth: isLandscape ? 'none' : 'min(100vw - 2rem, 800px)',
              aspectRatio: isLandscape ? 'auto' : `${UI.canvas.aspectRatio}`,
            }}
          >
            <canvas
              ref={canvasRef}
              width={UI.canvas.width}
              height={UI.canvas.height}
              className="w-full h-full rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* 모달 오버레이 */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Menu Screen */}
              {gameState === 'menu' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black/80 p-4 md:p-8 rounded-2xl pointer-events-auto max-w-[85%] w-full">
                  <h1 className="text-xl md:text-4xl mb-4 md:mb-6 font-black bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
                    K STADIUM Survival
                  </h1>

                  {startError && (
                    <div className="mb-3 p-2 md:p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-xs md:text-sm">
                      {startError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 justify-center items-center">
                    <button
                      onClick={startGame}
                      disabled={startLoading}
                      className={`w-full max-w-xs text-sm md:text-lg px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white border-none rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/40 uppercase font-bold tracking-wider ${startLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {startLoading ? 'Starting...' : 'Start Game'}
                    </button>

                    <button
                      onClick={startTestGame}
                      className="w-full max-w-xs text-xs md:text-base px-3 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white border-none rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-500/40 uppercase font-bold tracking-wider"
                    >
                      Test Play
                    </button>
                  </div>
                </div>
              )}

              {/* Pause Screen */}
              {gameState === 'paused' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black/90 p-6 md:p-10 rounded-2xl pointer-events-auto">
                  <h2 className="text-3xl md:text-4xl mb-4 md:mb-6 text-yellow-400 font-bold">Paused</h2>
                  {gameEngineRef.current?.isTestMode && (
                    <p className="text-xs md:text-sm text-yellow-300 mb-4">TEST MODE</p>
                  )}
                  <button
                    onClick={resumeGame}
                    className="text-lg md:text-xl px-6 py-3 bg-green-500 text-white border-none rounded-3xl cursor-pointer transition-colors hover:bg-green-600"
                  >
                    Resume
                  </button>
                </div>
              )}

              {/* Level Up Screen */}
              {gameState === 'levelup' && (
                <div className="absolute w-4/5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black/90 p-6 md:p-10 rounded-2xl pointer-events-auto animate-pulse">
                  <h2 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent font-bold">
                    Level Up!
                  </h2>
                  <p className="text-lg md:text-xl mb-6 text-gray-300">10% of lost health is restored.</p>
                  {gameEngineRef.current?.isTestMode && (
                    <p className="text-xs md:text-sm text-yellow-300 mb-4">TEST MODE</p>
                  )}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={levelUp}
                      className="text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-400 to-red-600 text-white border-none rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/40 uppercase font-bold tracking-wider"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Game Over Screen */}
              {gameState === 'gameover' && (
                <div className="absolute w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black/90 p-6 md:p-10 rounded-2xl pointer-events-auto max-w-[90%]">
                  <h2 className="text-3xl md:text-4xl mb-4 md:mb-6 text-red-500 font-bold">Game Over</h2>
                  {(() => {
                    const finalStats = gameEngineRef.current?.getFinalStats();
                    return (
                      <>
                        <p className="text-base md:text-lg mb-2 text-white">Kills: {finalStats?.kills || 0}</p>
                        <p className="text-base md:text-lg mb-4 md:mb-6 text-white">Level: {finalStats?.level || 1}</p>
                      </>
                    );
                  })()}

                  {gameEngineRef.current?.isTestMode && (
                    <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 text-sm">
                      TEST MODE - No score saved
                    </div>
                  )}

                  {!gameEngineRef.current?.isTestMode && scoreLoading && (
                    <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-200 text-sm">
                      Saving score...
                    </div>
                  )}

                  {!gameEngineRef.current?.isTestMode && scoreError && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                      Failed to save score: {scoreError}
                    </div>
                  )}

                  <button
                    onClick={restartGame}
                    className="text-base md:text-lg px-6 py-3 bg-blue-500 text-white border-none rounded-3xl cursor-pointer transition-colors hover:bg-blue-600"
                  >
                    Restart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 가로 모드일 때 오른쪽 사이드바 */}
        {isLandscape && (
          <div className="flex flex-col gap-2 w-32 p-2 justify-center bg-black/30 rounded-lg">
            <div className="bg-black/70 rounded-lg p-3">
              <div className="text-white font-bold text-sm mb-3">Status</div>
              {gameState === 'playing' ? (
                <div className="space-y-3">
                  {/* HP Bar */}
                  <div>
                    <div className="text-white text-xs mb-1">HP</div>
                    <div className="w-full h-3 bg-black/50 border border-gray-600 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-sm transition-all duration-300"
                        style={{ width: `${(gameStats.hp / gameStats.maxHp) * 100}%` }}
                      />
                    </div>
                    <div className="text-white text-xs mt-1">{gameStats.hp}/{gameStats.maxHp}</div>
                  </div>

                  {/* EXP Bar */}
                  <div>
                    <div className="text-white text-xs mb-1">EXP</div>
                    <div className="w-full h-3 bg-black/50 border border-gray-600 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-sm transition-all duration-300"
                        style={{ width: `${(gameStats.exp / gameStats.maxExp) * 100}%` }}
                      />
                    </div>
                    <div className="text-white text-xs mt-1">{gameStats.exp}/{gameStats.maxExp}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Empty HP Bar */}
                  <div>
                    <div className="text-white/50 text-xs mb-1">HP</div>
                    <div className="w-full h-3 bg-black/50 border border-gray-600 rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-sm" style={{ width: '0%' }} />
                    </div>
                    <div className="text-white/50 text-xs mt-1">--/--</div>
                  </div>

                  {/* Empty EXP Bar */}
                  <div>
                    <div className="text-white/50 text-xs mb-1">EXP</div>
                    <div className="w-full h-3 bg-black/50 border border-gray-600 rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-sm" style={{ width: '0%' }} />
                    </div>
                    <div className="text-white/50 text-xs mt-1">--/--</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 하단 상태바 (세로 모드만) */}
        {!isLandscape && (
          <div className="flex flex-col gap-1 w-full px-4 max-w-4xl mx-auto">
            {gameState === 'playing' ? (
              <>
                {/* HP Bar */}
                <div className="w-full h-4 md:h-5 bg-black/50 border border-gray-600 rounded-xl overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-lg transition-all duration-300"
                    style={{ width: `${(gameStats.hp / gameStats.maxHp) * 100}%` }}
                  />
                </div>

                {/* EXP Bar */}
                <div className="w-full h-3 md:h-4 bg-black/50 border border-gray-600 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-md transition-all duration-300"
                    style={{ width: `${(gameStats.exp / gameStats.maxExp) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Empty HP Bar */}
                <div className="w-full h-4 md:h-5 bg-black/50 border border-gray-600 rounded-xl overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg" style={{ width: '0%' }} />
                </div>

                {/* Empty EXP Bar */}
                <div className="w-full h-3 md:h-4 bg-black/50 border border-gray-600 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-md" style={{ width: '0%' }} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 조이스틱과 방향키 */}
      {PlayerSetting.controlScheme === 'joystick' && (
        <Joystick
          onMove={(vec) => {
            if (gameEngineRef.current) gameEngineRef.current.inputVector = vec;
          }}
          position={PlayerSetting.joystickPosition}
          offset={{
            x: PlayerSetting.joystickOffset.x,
            y: PlayerSetting.joystickOffset.y
          }}
        />
      )}

      {PlayerSetting.controlScheme === 'arrows' && (
        <ArrowPad
          onMove={(vec) => {
            if (gameEngineRef.current) gameEngineRef.current.inputVector = vec;
          }}
          position={PlayerSetting.arrowPadPosition}
          offset={{
            x: PlayerSetting.arrowPadOffset.x,
            y: PlayerSetting.arrowPadOffset.y
          }}
        />
      )}

      {/* Settings Modal */}
      {showPlayerSettings && (
        <PlayerSettingsModal
          onClose={() => setShowPlayerSettings(false)}
        />
      )}
    </div>
  );
};

const PlayerSettingsModal = ({ onClose }) => {
  const [controlScheme, setControlScheme] = useState(PlayerSetting.controlScheme);
  const [joystickSide, setJoystickSide] = useState(PlayerSetting.joystickPosition);
  const [offsetX, setOffsetX] = useState(PlayerSetting.joystickOffset.x);
  const [offsetY, setOffsetY] = useState(PlayerSetting.joystickOffset.y);
  const [arrowSide, setArrowSide] = useState(PlayerSetting.arrowPadPosition);
  const [arrowX, setArrowX] = useState(PlayerSetting.arrowPadOffset.x);
  const [arrowY, setArrowY] = useState(PlayerSetting.arrowPadOffset.y);

  const apply = () => {
    PlayerSetting.controlScheme = controlScheme;
    PlayerSetting.joystickPosition = joystickSide;
    PlayerSetting.joystickOffset = { x: Number(offsetX) || 0, y: Number(offsetY) || 0 };
    PlayerSetting.arrowPadPosition = arrowSide;
    PlayerSetting.arrowPadOffset = { x: Number(arrowX) || 0, y: Number(arrowY) || 0 };
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-gray-800 p-4 md:p-6 rounded-lg text-white max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg md:text-xl font-bold mb-4">Player Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Control Scheme</label>
            <select
              value={controlScheme}
              onChange={(e) => setControlScheme(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
            >
              <option value="joystick">Joystick</option>
              <option value="arrows">Arrow Pad</option>
            </select>
          </div>

          {controlScheme === 'joystick' && (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium">Joystick Position</label>
                <select
                  value={joystickSide}
                  onChange={(e) => setJoystickSide(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Offset X</label>
                  <input
                    type="number"
                    value={arrowX}
                    onChange={(e) => setArrowX(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Offset Y</label>
                  <input
                    type="number"
                    value={arrowY}
                    onChange={(e) => setArrowY(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-4 py-3 bg-gray-600 rounded hover:bg-gray-500 transition-colors text-base"
          >
            Cancel
          </button>
          <button
            onClick={apply}
            className="w-full md:w-auto px-4 py-3 bg-blue-600 rounded hover:bg-blue-500 transition-colors text-base"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;