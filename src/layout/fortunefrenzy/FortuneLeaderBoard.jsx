import React, { useEffect } from 'react';
import { useBringFortuneLeaderBoard } from '@/hooks';

const FortuneLeaderBoard = () => {
    const { 
        bringFortuneLeaderBoard, 
        loading, 
        error, 
        currentType, 
        currentData, 
        setCurrentType, 
        clearError 
    } = useBringFortuneLeaderBoard();
    
    const leaderboardData = currentData || [];

    useEffect(() => {
        bringFortuneLeaderBoard('BestRound');
    }, []);

    const handleTypeChange = async (type) => {
        if (error) clearError();
        setCurrentType(type);
        await bringFortuneLeaderBoard(type);
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${rank}`;
        }
    };

    const formatId = (id) => {
        if (!id) return 'Unknown';
        if (id.length > 20 && id.startsWith('0x')) {
            return `${id.slice(0, 6)}...${id.slice(-4)}`;
        }
        return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
    };

    const formatNumber = (num) => {
        return num?.toLocaleString() || '0';
    };

    const formatPercentage = (rate) => {
        return `${(rate * 100).toFixed(1)}%`;
    };

    const formatAverage = (avg) => {
        return avg?.toFixed(1) || '0.0';
    };

    const handleRefresh = () => {
        bringFortuneLeaderBoard(currentType);
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 px-2 md:px-6 pb-8">
            <div className="w-full mx-auto w-1/2">
                {/* 헤더 */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
                        FORTUNE FRENZY LEADERBOARD
                    </h1>
                    <p className="text-base md:text-lg text-white/70">
                        Check out the top players in Fortune Frenzy
                    </p>
                </div>

                {/* 타입 선택 버튼 */}
                <div className="flex justify-center mb-6">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-1.5 flex gap-1.5 border border-purple-500/20">
                        <button
                            onClick={() => handleTypeChange('BestRound')}
                            disabled={loading}
                            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-50 ${
                                currentType === 'BestRound'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'text-black bg-white hover:text-white hover:bg-white/10'
                            }`}
                        >
                            🏆 BEST ROUND
                        </button>
                        <button
                            onClick={() => handleTypeChange('TotalGames')}
                            disabled={loading}
                            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-50 ${
                                currentType === 'TotalGames'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                    : 'text-black bg-white hover:text-white hover:bg-white/10'
                            }`}
                        >
                            🎮 TOTAL GAMES
                        </button>
                    </div>
                </div>

                {/* 로딩 상태 */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mb-3"></div>
                        <p className="text-white/70 text-sm">Loading leaderboard...</p>
                    </div>
                )}

                {/* 에러 상태 */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                        <p className="text-red-400 text-center text-sm">{error}</p>
                    </div>
                )}

                {/* 리더보드 테이블 */}
                {!loading && !error && leaderboardData && Array.isArray(leaderboardData) && leaderboardData.length > 0 && (
                    <div className="w-full bg-black/25 backdrop-blur-md rounded-xl border border-purple-500/20 overflow-hidden shadow-2xl">
                        <div className="w-full overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full min-w-full table-auto">
                                <thead className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 border-b border-purple-500/20">
                                    <tr>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            RANK
                                        </th>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            PLAYER
                                        </th>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            BEST ROUND
                                        </th>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            TOTAL GAMES
                                        </th>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            WIN RATE
                                        </th>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            AVG ROUNDS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((player, index) => (
                                        <tr 
                                            key={player.id || index}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                                        >
                                            <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4">
                                                <div className="flex items-center justify-center">
                                                    <span className="text-sm md:text-lg lg:text-2xl">
                                                        {getRankIcon(index + 1)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4">
                                                <span className="text-white font-mono bg-white/10 px-1 md:px-2 lg:px-3 py-1 rounded text-xs md:text-sm">
                                                    {formatId(player.id)}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                <span className="text-yellow-400 font-bold text-xs md:text-sm lg:text-base">
                                                    Round {formatNumber(player.best_round || 0)}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                <span className="text-green-400 font-semibold text-xs md:text-sm lg:text-base">
                                                    {formatNumber(player.total_games || 0)}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                <span className="text-blue-400 font-semibold text-xs md:text-sm lg:text-base">
                                                    {formatPercentage(player.win_rate || 0)}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                <span className="text-purple-400 font-semibold text-xs md:text-sm lg:text-base">
                                                    {formatAverage(player.average_rounds || 0)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 데이터가 없을 때 */}
                {!loading && !error && (!leaderboardData || leaderboardData.length === 0) && (
                    <div className="text-center py-8">
                        <p className="text-white/50 text-base">No leaderboard data available</p>
                    </div>
                )}

                {/* 새로고침 버튼 */}
                <div className="text-center mt-6">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white font-semibold px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        {loading ? 'Refreshing...' : '🔄 Refresh Leaderboard'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FortuneLeaderBoard;