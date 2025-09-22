import React, { useRef, useEffect, useState, useCallback } from 'react';
import UI from './setting/UI.jsx';
import PlayerSetting from './setting/PlayerSetting.jsx';
import GameHandle from './systems/GameHandle.jsx';
import { ArrowPad, Joystick } from './systems/GameControl.jsx';
import { useGameStart } from '../../hooks/useGameStart.jsx';
import { useGameScorePost } from '../../hooks/useGameScorePost.jsx';
import SettingModal from './SettingModal.jsx';
import GameModal from './GameModal.jsx';
import { CiSettings } from "react-icons/ci";
import { CiPause1 } from "react-icons/ci";

const Game = () => {
  const canvasRef = useRef(null);
  const gameHandleRef = useRef(null);
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

  // 설정 모달 상태 및 게임 일시정지 처리
  const [showPlayerSettings, setShowPlayerSettings] = useState(false);
  const [previousGameState, setPreviousGameState] = useState(null);

  // 설정 모달 열기
  const openSettings = () => {
    if (gameState === 'playing') {
      setPreviousGameState('playing');
      gameHandleRef.current?.pauseGame(); // GameHandle의 pauseGame() 호출
    }
    setShowPlayerSettings(true);
  };

  // 설정 모달 닫기
  const closeSettings = () => {
    setShowPlayerSettings(false);
    if (previousGameState === 'playing') {
      setGameState('playing');  // 👈 이것만으로는 부족
      gameHandleRef.current?.resumeGame();  // 👈 이것도 호출해야 함
      setPreviousGameState(null);
    }
  };

  // 게임 일시정지
  const pauseGame = () => {
    if (gameState === 'playing') {
      gameHandleRef.current?.pauseGame(); // 이렇게 GameHandle의 pauseGame() 호출
    }
  };

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

  // React state 완전히 무시하고 게임 핸들 플래그만 사용하여 클로저 문제 완전 해결
  const handleStateChange = useCallback(async (newState) => {
    const isTestMode = gameHandleRef.current?.isTestMode === true;

    setGameState(newState);

    if (newState === 'gameover') {
      console.log('Game over detected - handle test mode:', isTestMode);

      if (isTestMode) {
        console.log('🚫 TEST MODE - No score saved');
        return;
      }

      // 테스트 모드가 아닐 때만 점수 저장
      console.log('Normal mode - attempting to save score');
      const finalStats = gameHandleRef.current?.getFinalStats();
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

    const gameHandle = new GameHandle(canvas, {
      onStateChange: handleStateChange,
      onStatsUpdate: setGameStats
    });

    gameHandleRef.current = gameHandle;
    gameHandle.init();

    return () => {
      gameHandle.destroy();
    };
  }, []);

  const startGame = async () => {
    try {
      console.log('Starting normal game...');

      // 게임 핸들에 명시적으로 normal 모드 설정
      if (gameHandleRef.current) {
        gameHandleRef.current.isTestMode = false;
      }

      const gameSession = await apiStartGame();
      if (gameSession) {
        console.log('Game session created, starting game handle');
        gameHandleRef.current?.startGame();
      } else {
        console.error('Failed to create game session');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const startTestGame = () => {
    console.log('Starting test game...');

    // 게임 핸들에 명시적으로 test 모드 설정
    if (gameHandleRef.current) {
      gameHandleRef.current.isTestMode = true;
      console.log('Test mode flag set, starting game...');
      gameHandleRef.current.startGame();
    } else {
      console.error('Game handle not initialized!');
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

    if (gameHandleRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const gameHandle = new GameHandle(canvas, {
          onStateChange: handleStateChange,
          onStatsUpdate: setGameStats
        });
        gameHandleRef.current = gameHandle;
        gameHandle.init();
      }
    }
  };

  const resumeGame = () => {
    gameHandleRef.current?.resumeGame();
  };

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
                {gameHandleRef.current?.isTestMode && (
                  <div className="text-yellow-400 text-xs mt-2">TEST MODE</div>
                )}
              </div>
            </div>

            {/* 가로 모드 버튼들 */}
            <div className="flex flex-col gap-2">
              {gameState === 'playing' && (
                <button
                  onClick={pauseGame}
                  className="p-3 bg-black/80 text-white border border-white rounded-lg hover:bg-black transition-colors"
                  aria-label="pause"
                  title="Pause Game"
                >
                  <CiPause1 size={18} />
                </button>
              )}
              <button
                onClick={openSettings}
                className="p-3 bg-black/80 text-white border border-white rounded-lg hover:bg-black transition-colors"
                aria-label="settings"
                title="Settings"
              >
                <CiSettings size={18} />
              </button>
            </div>
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
                {gameHandleRef.current?.isTestMode && (
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

            {/* 세로 모드 버튼들 */}
            <div className="flex gap-2">
              {gameState === 'playing' && (
                <button
                  onClick={pauseGame}
                  className="p-2 bg-black/80 text-white border border-white rounded-lg hover:bg-black transition-colors"
                  aria-label="pause"
                  title="Pause Game"
                >
                  <CiPause1 size={20} />
                </button>
              )}
              <button
                onClick={openSettings}
                className="p-2 bg-black/80 text-white border border-white rounded-lg hover:bg-black transition-colors"
                aria-label="settings"
                title="Settings"
              >
                <CiSettings size={20} />
              </button>
            </div>
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
          </div>
        </div>

        {/* 가로 모드일 때 오른쪽 사이드바 */}
        {isLandscape && (
          <div className="flex flex-col gap-2 w-32 p-2 justify-center bg-black/30 rounded-lg">
            <div className="bg-black/70 rounded-lg p-3">
              <div className="text-white font-bold text-sm mb-3">Status</div>
              {(gameState === 'playing' || gameState === 'levelup') ? (
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
            {(gameState === 'playing' || gameState === 'levelup') ? (
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
            if (gameHandleRef.current) gameHandleRef.current.setInputVector(vec.x, vec.y);
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
            if (gameHandleRef.current) gameHandleRef.current.setInputVector(vec.x, vec.y);
          }}
          position={PlayerSetting.arrowPadPosition}
          offset={{
            x: PlayerSetting.arrowPadOffset.x,
            y: PlayerSetting.arrowPadOffset.y
          }}
        />
      )}

      {/* Game Modal - 분리된 컴포넌트 */}
      <GameModal
        gameState={gameState}
        gameHandleRef={gameHandleRef}
        startGame={startGame}
        startTestGame={startTestGame}
        resumeGame={resumeGame}
        restartGame={restartGame}
        startLoading={startLoading}
        startError={startError}
        scoreLoading={scoreLoading}
        scoreError={scoreError}
      />

      {/* Settings Modal */}
      {showPlayerSettings && (
        <SettingModal
          onClose={closeSettings}
        />
      )}
    </div>
  );
};

export default Game;