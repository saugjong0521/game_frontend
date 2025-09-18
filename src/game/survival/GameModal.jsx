import React from 'react';

const GameModal = ({ 
  gameState, 
  gameHandleRef, 
  startGame, 
  startTestGame, 
  resumeGame, 
  restartGame,
  startLoading,
  startError,
  scoreLoading,
  scoreError 
}) => {
  
  if (gameState === 'playing') return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full h-full flex items-center justify-center p-4">
        
        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 rounded-3xl border border-gray-600 shadow-2xl max-w-md w-full">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl mb-8 font-black bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
                K STADIUM
              </h1>
              <h2 className="text-xl md:text-2xl mb-8 text-gray-300 font-bold">
                Survival
              </h2>

              {startError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-sm">
                  {startError}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={startGame}
                  disabled={startLoading}
                  className={`w-full text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 font-bold tracking-wider ${
                    startLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {startLoading ? 'Starting...' : 'START GAME'}
                </button>

                <button
                  onClick={startTestGame}
                  className="w-full text-base px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/50 font-bold tracking-wider"
                >
                  TEST PLAY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pause Screen */}
        {gameState === 'paused' && (
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 rounded-3xl border border-gray-600 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-4xl md:text-5xl mb-6 text-yellow-400 font-bold">PAUSED</h2>
            {gameHandleRef.current?.isTestMode && (
              <p className="text-sm text-yellow-300 mb-6">TEST MODE</p>
            )}
            <button
              onClick={resumeGame}
              className="text-xl px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 font-bold"
            >
              RESUME
            </button>
          </div>
        )}

        {/* Level Up Screen */}
        {gameState === 'levelup' && (
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 md:p-8 rounded-3xl border border-yellow-500/50 shadow-2xl max-w-6xl w-full">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-6xl mb-4 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent font-bold animate-pulse">
                LEVEL UP!
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 font-semibold">Choose your upgrade</p>
              {gameHandleRef.current?.isTestMode && (
                <p className="text-sm text-yellow-300 mt-2">TEST MODE</p>
              )}
            </div>
            
            {/* Stat Cards - 3개만 랜덤 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(() => {
                const levelUpCards = {
                  health: {
                    name: "체력 증가",
                    description: "최대 체력이 10 증가합니다",
                    icon: "❤️",
                    color: "from-red-500 to-red-700"
                  },
                  speed: {
                    name: "이동속도 증가", 
                    description: "이동속도가 15 증가합니다",
                    icon: "💨",
                    color: "from-blue-500 to-blue-700"
                  },
                  attackSpeed: {
                    name: "공격속도 증가",
                    description: "공격 간격이 0.05초 감소합니다",
                    icon: "⚡",
                    color: "from-yellow-500 to-yellow-700"
                  },
                  damage: {
                    name: "공격력 증가",
                    description: "공격력이 5 증가합니다", 
                    icon: "⚔️",
                    color: "from-orange-500 to-orange-700"
                  }
                };
                
                // GameEngine에서 랜덤 카드 3개 생성
                const selectedCardTypes = gameHandleRef.current?.gameEngine?.generateLevelUpCards() || ['health', 'speed', 'damage'];
                
                return selectedCardTypes.map((cardType) => {
                  const card = levelUpCards[cardType];
                  return (
                    <div 
                      key={cardType}
                      onClick={() => {
                        if (gameHandleRef.current) {
                          gameHandleRef.current.selectStatUpgrade(cardType);
                        }
                      }}
                      className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-2xl border-2 border-white/20 hover:border-white/40 group`}
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                          {card.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-200 transition-colors">
                          {card.name}
                        </h3>
                        <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 rounded-3xl border border-red-500/50 shadow-2xl max-w-lg w-full text-center">
            <h2 className="text-4xl md:text-5xl mb-6 text-red-500 font-bold">GAME OVER</h2>
            
            {(() => {
              const finalStats = gameHandleRef.current?.getFinalStats();
              return (
                <div className="mb-8 space-y-2">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
                    <p className="text-2xl text-white mb-2">
                      <span className="text-gray-400">Kills:</span> {finalStats?.kills || 0}
                    </p>
                    <p className="text-2xl text-white mb-2">
                      <span className="text-gray-400">Level:</span> {finalStats?.level || 1}
                    </p>
                    <p className="text-xl text-gray-300">
                      <span className="text-gray-400">Time:</span> {formatTime(finalStats?.time || 0)}
                    </p>
                  </div>
                </div>
              );
            })()}

            {gameHandleRef.current?.isTestMode && (
              <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-xl text-yellow-200">
                TEST MODE - No score saved
              </div>
            )}

            {!gameHandleRef.current?.isTestMode && scoreLoading && (
              <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-xl text-blue-200">
                Saving score...
              </div>
            )}

            {!gameHandleRef.current?.isTestMode && scoreError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200">
                Failed to save score: {scoreError}
              </div>
            )}

            <button
              onClick={restartGame}
              className="text-xl px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 font-bold"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModal;