import React, { useEffect, useRef } from 'react';
import { useFortuneBoxStore, useFortuneSessionStore } from '@/store';
import { useFortuneStart, useSelectBox, useFortuneCashout } from '@/hooks';

const FortuneFrenzy = () => {
    const scrollContainerRef = useRef(null);

    const {
        gameStarted,
        loading: startLoading,
        startGame,
        setGameStarted
    } = useFortuneStart();

    const [isGameOver, setIsGameOver] = React.useState(false);
    const [isCashedOut, setIsCashedOut] = React.useState(false);
    const [finalRound, setFinalRound] = React.useState(0);
    const [finalMultiplier, setFinalMultiplier] = React.useState(0);

    const { rounds, selectedBoxes, minePositions, clearRounds } = useFortuneBoxStore();
    const { sessionId, currentRound, clearSession } = useFortuneSessionStore();

    const {
        selectBox,
        loading: selectLoading
    } = useSelectBox();

    const { cashout, loading: cashoutLoading } = useFortuneCashout();

    const loading = startLoading || selectLoading || cashoutLoading;

    useEffect(() => {
        if (gameStarted && scrollContainerRef.current) {
            setTimeout(() => {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }, 100);
        }
    }, [gameStarted]);

    const handleScroll = () => {
        if (!scrollContainerRef.current || loading) return;

        const { scrollTop } = scrollContainerRef.current;

        if (scrollTop < 100) {
            loadMoreRounds();
        }
    };

    const loadMoreRounds = () => {
        // TODO: 클라이언트에서 추가 라운드 생성 로직
    };

    const handleBoxClick = async (roundNumber, boxIndex) => {
        if (roundNumber !== currentRound || isGameOver || isCashedOut) return;

        try {
            const result = await selectBox(boxIndex);
            if (!result.success) {
                setIsGameOver(true);
            }
        } catch (error) {
            console.error('Box selection error:', error);
        }
    };

    const handleCashout = async () => {
        if (isGameOver || isCashedOut) return;
        
        const confirmed = window.confirm('캐시아웃 하시겠습니까?');
        if (!confirmed) return;

        try {
            // 이전 라운드의 cumulative_multiplier를 가져오기 (현재 라운드가 아님!)
            const previousRoundData = rounds.find(r => r.round === currentRound - 1);
            const multiplier = previousRoundData?.cumulative_multiplier || 1.0;
            
            const result = await cashout();
            if (result.success) {
                setIsCashedOut(true);
                setFinalRound(result.finalRound);
                setFinalMultiplier(multiplier);
            } else {
                alert('캐시아웃 실패');
            }
        } catch (error) {
            console.error('Cashout error:', error);
            alert('캐시아웃 중 오류 발생');
        }
    };

    const handleTryAgain = () => {
        setGameStarted(false);
        setIsGameOver(false);
        setIsCashedOut(false);
        setFinalRound(0);
        setFinalMultiplier(0);
        clearSession(); // 세션 클리어 추가
        clearRounds();
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-6xl">
                <h1 className="text-2xl sm:text-4xl font-bold text-white text-center mb-4 sm:mb-8">
                    Fortune Frenzy
                </h1>

                {!gameStarted ? (
                    <div className="flex justify-center">
                        <button
                            onClick={startGame}
                            disabled={loading}
                            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg sm:text-xl font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Starting...' : 'Start Game'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-800/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm border border-purple-500/30">
                        {isGameOver && (
                            <div className="mb-4 bg-red-900/50 border-2 border-red-500 rounded-lg p-4 text-center">
                                <h2 className="text-2xl font-bold text-red-400 mb-2">💥 Game Over!</h2>
                                <p className="text-white mb-4">You hit a mine! Review your choices below.</p>
                                <button
                                    onClick={handleTryAgain}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {isCashedOut && (
                            <div className="mb-4 bg-green-900/50 border-2 border-green-500 rounded-lg p-4 text-center">
                                <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 Cashed Out!</h2>
                                <p className="text-white mb-2">Congratulations! You successfully cashed out.</p>
                                <div className="mb-4">
                                    <p className="text-yellow-400 text-3xl font-bold mb-1">{finalMultiplier.toFixed(2)}x</p>
                                    <p className="text-gray-300 text-sm">Final Round: {finalRound}</p>
                                </div>
                                <button
                                    onClick={handleTryAgain}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                        
                        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                            <div className="text-white text-xs sm:text-sm">
                                <span className="text-gray-400">Session:</span>
                                <span className="ml-1 sm:ml-2 font-mono">{sessionId?.slice(0, 8)}...</span>
                            </div>
                            <div className="text-white text-xs sm:text-sm">
                                <span className="text-gray-400">Round:</span>
                                <span className="ml-1 sm:ml-2 font-bold">{currentRound}</span>
                            </div>
                            <button 
                                onClick={handleCashout}
                                disabled={cashoutLoading || isGameOver || isCashedOut}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cashoutLoading ? 'Processing...' : 'Cash Out'}
                            </button>
                        </div>

                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="h-[500px] sm:h-[600px] overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-4 custom-scrollbar"
                        >
                            {loading && (
                                <div className="text-center py-2 text-gray-400 text-sm">
                                    Loading...
                                </div>
                            )}

                            {rounds.map((roundData) => {
                                const isCurrentRound = roundData.round === currentRound;
                                const isPastRound = roundData.round < currentRound;

                                return (
                                    <div
                                        key={roundData.round}
                                        className={`flex items-center gap-1 sm:gap-4 bg-gray-900/50 p-2 sm:p-4 rounded-lg border transition-colors ${
                                            isCurrentRound
                                                ? 'border-yellow-500 shadow-lg shadow-yellow-500/20'
                                                : isPastRound
                                                ? 'border-green-700 opacity-60'
                                                : 'border-gray-700'
                                        }`}
                                    >
                                        <div className="w-12 sm:w-20 text-right flex-shrink-0">
                                            <div className="text-yellow-400 font-bold text-sm sm:text-lg">
                                                {roundData.cumulative_multiplier.toFixed(2)}x
                                            </div>
                                            <div className="text-gray-400 text-[10px] sm:text-xs">
                                                R{roundData.round}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex justify-center items-center">
                                            <div className="flex flex-wrap justify-center gap-1 sm:gap-2" style={{
                                                maxWidth: roundData.box_count <= 4 ? '100%' : '75%'
                                            }}>
                                            {Array.from({ length: roundData.box_count }).map((_, i) => {
                                                const isSelected = selectedBoxes[roundData.round] === i;
                                                const isMine = minePositions[roundData.round] === i;

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleBoxClick(roundData.round, i)}
                                                        disabled={!isCurrentRound || loading || isGameOver || isCashedOut}
                                                        style={{
                                                            width: roundData.box_count <= 4 ? 'calc(25% - 4px)' : 'calc(23% - 4px)',
                                                            minWidth: '40px',
                                                            maxWidth: '70px'
                                                        }}
                                                        className={`aspect-square rounded border sm:border-2 transition-all flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-2xl shadow-lg ${
                                                            isPastRound
                                                                ? isMine
                                                                    ? 'bg-red-600 border-red-800'
                                                                    : isSelected
                                                                    ? 'bg-green-600 border-green-800'
                                                                    : 'bg-gray-700 border-gray-600'
                                                                : isCurrentRound
                                                                ? (isGameOver || isCashedOut)
                                                                    ? isMine
                                                                        ? 'bg-red-600 border-red-800'
                                                                        : isSelected
                                                                        ? 'bg-green-600 border-green-800'
                                                                        : 'bg-gray-700 border-gray-600'
                                                                    : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-purple-500 hover:from-purple-600/20 hover:to-gray-700 active:scale-95 cursor-pointer'
                                                                : 'bg-gray-800/50 border-gray-700/50 opacity-50 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {isPastRound
                                                            ? isMine
                                                                ? '💣'
                                                                : isSelected
                                                                ? '✓'
                                                                : '?'
                                                            : isCurrentRound && isGameOver
                                                            ? isMine
                                                                ? '💣'
                                                                : isSelected
                                                                ? '✓'
                                                                : '?'
                                                            : isCurrentRound && isCashedOut
                                                            ? isMine
                                                                ? '💣'
                                                                : isSelected
                                                                ? '✓'
                                                                : '?'
                                                            : '?'}
                                                    </button>
                                                );
                                            })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.7);
                }
            `}</style>
        </div>
    );
};

export default FortuneFrenzy;