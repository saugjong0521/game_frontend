import React, { useEffect, useRef, useState } from 'react';
import { useFortuneBoxStore, useFortuneSessionStore } from '@/store';
import { useFortuneStart, useSelectBox, useFortuneCashout } from '@/hooks';

const FortuneFrenzy = () => {
    const scrollContainerRef = useRef(null);
    const gameContentRef = useRef(null);
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const scrollTopRef = useRef(0);

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

    useEffect(() => {
        if ((isGameOver || isCashedOut) && gameContentRef.current) {
            gameContentRef.current.scrollTop = 0;
        }
    }, [isGameOver, isCashedOut]);

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

    // 드래그 시작
    const handleDragStart = (e) => {
        isDraggingRef.current = true;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        startYRef.current = clientY;
        scrollTopRef.current = scrollContainerRef.current.scrollTop;
        
        
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grabbing';
            scrollContainerRef.current.style.userSelect = 'none';
        }
    };

    // 드래그 중
    const handleDragMove = (e) => {
        if (!isDraggingRef.current) {
            console.log('⚠️ Not dragging, skipping move');
            return;
        }
        
        e.preventDefault();
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const deltaY = startYRef.current - clientY;
        
        console.log('🔄 Drag Move - ClientY:', clientY, 'Delta:', deltaY, 'Original ScrollTop:', scrollTopRef.current);
        
        if (scrollContainerRef.current) {
            const newScrollTop = scrollTopRef.current + deltaY;
            const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
            const clampedScrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
            
            scrollContainerRef.current.scrollTop = clampedScrollTop;
            console.log('📜 Clamped Scroll Top:', clampedScrollTop, 'Max:', maxScroll);
        }
    };

    // 드래그 종료
    const handleDragEnd = (e) => {
        console.log('🛑 Drag End:', e.type);
        isDraggingRef.current = false;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.userSelect = 'auto';
        }
    };

    const handleBoxClick = async (roundNumber, boxIndex) => {
        console.log('🎯 Box Click - Dragging:', isDraggingRef.current);
        if (roundNumber !== currentRound || isGameOver || isCashedOut || isDraggingRef.current) return;

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
        clearSession();
        clearRounds();
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
            <div className="h-[10vh] flex items-center justify-center px-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-white text-center">
                    Fortune Frenzy
                </h1>
            </div>

            <div ref={gameContentRef} className="h-[70vh] px-2 sm:px-4 flex flex-col">
                {!gameStarted ? (
                    <div className="flex-1 flex items-start justify-center">
                        <button
                            onClick={startGame}
                            disabled={loading}
                            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg sm:text-xl font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Starting...' : 'Start Game'}
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 bg-gray-800/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm border border-purple-500/30 flex flex-col overflow-y-auto">
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
                        
                        <div className="flex-shrink-0 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
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
                            onMouseDown={handleDragStart}
                            onMouseMove={handleDragMove}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={handleDragStart}
                            onTouchMove={handleDragMove}
                            onTouchEnd={handleDragEnd}
                            className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-4 custom-scrollbar"
                            style={{ cursor: 'grab', touchAction: 'none' }}
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
                                                ? 'border-green-700'
                                                : 'border-gray-700'
                                        }`}
                                    >
                                        <div className={`w-12 sm:w-20 text-right flex-shrink-0 ${isPastRound ? 'opacity-60' : ''}`}>
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
                                                        className={`aspect-square rounded border sm:border-2 transition-all flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-2xl ${
                                                            isPastRound
                                                                ? isMine
                                                                    ? 'bg-red-600 border-red-800'
                                                                    : isSelected
                                                                    ? 'bg-green-600 border-green-800'
                                                                    : 'bg-gray-700 border-gray-600 shadow-lg'
                                                                : isCurrentRound
                                                                ? (isGameOver || isCashedOut)
                                                                    ? isMine
                                                                        ? 'bg-red-600 border-red-800'
                                                                        : isSelected
                                                                        ? 'bg-green-600 border-green-800'
                                                                        : 'bg-gray-700 border-gray-600 shadow-lg'
                                                                    : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-purple-500 hover:from-purple-600/20 hover:to-gray-700 active:scale-95 cursor-pointer shadow-lg'
                                                                : 'bg-gray-800/50 border-gray-700/50 opacity-50 cursor-not-allowed shadow-lg'
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

            <div className="h-[10vh]"></div>

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