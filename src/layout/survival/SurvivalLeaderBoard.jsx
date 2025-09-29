import React, { useEffect } from 'react';
import { useBringLeaderBoard } from '@/hooks';

const SurvivalLeaderBoard = () => {
    const { 
        bringLeaderBoard, 
        loading, 
        error, 
        currentType, 
        currentData, 
        setCurrentType, 
        clearError 
    } = useBringLeaderBoard();
    
    const leaderboardData = currentData || [];

    useEffect(() => {
        bringLeaderBoard('TopScore');
    }, []);

    const handleTypeChange = async (type) => {
        if (error) clearError();
        setCurrentType(type);
        await bringLeaderBoard(type);
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

    const formatScore = (score) => {
        return score?.toLocaleString() || '0';
    };

    const handleRefresh = () => {
        bringLeaderBoard(currentType);
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-2 md:px-6 pb-8">
            <div className="w-full mx-auto w-1/2">
                {/* 헤더 */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                        LEADERBOARD
                    </h1>
                    <p className="text-base md:text-lg text-white/70">
                        Check out the top players in SURVIVAL Game
                    </p>
                </div>

                {/* 타입 선택 버튼 */}
                <div className="flex justify-center mb-6">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-1.5 flex gap-1.5 border border-purple-500/20">
                        <button
                            onClick={() => handleTypeChange('TopScore')}
                            disabled={loading}
                            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-50 ${
                                currentType === 'TopScore'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-black bg-white hover:text-white hover:bg-white/10'
                            }`}
                        >
                            🏆 TOP SCORE
                        </button>
                        <button
                            onClick={() => handleTypeChange('MostPlay')}
                            disabled={loading}
                            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-50 ${
                                currentType === 'MostPlay'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'text-black bg-white hover:text-white hover:bg-white/10'
                            }`}
                        >
                            🎮 MOST PLAYS
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
                                <thead className="sticky top-0 bg-gradient-to-r from-purple-500 to-blue-500 border-b border-purple-500/20">
                                    <tr>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            RANK
                                        </th>
                                        <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                            PLAYER
                                        </th>
                                        {currentType === 'TopScore' ? (
                                            <>
                                                <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                                    SCORE
                                                </th>
                                                <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                                    LEVEL
                                                </th>
                                                <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                                    KILLS
                                                </th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                                    PLAYS
                                                </th>
                                                <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                                    LEVEL
                                                </th>
                                                <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-center text-white font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap">
                                                    KILLS
                                                </th>
                                            </>
                                        )}
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
                                            {currentType === 'TopScore' ? (
                                                <>
                                                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                        <span className="text-yellow-400 font-bold text-xs md:text-sm lg:text-base">
                                                            {formatScore(player.score || 0)}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                        <span className="text-blue-400 font-semibold text-xs md:text-sm lg:text-base">
                                                            {player.level || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                        <span className="text-red-400 font-semibold text-xs md:text-sm lg:text-base">
                                                            {player.kill || 0}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                        <span className="text-green-400 font-bold text-xs md:text-sm lg:text-lg">
                                                            {formatScore(player.play || 0)}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                        <span className="text-blue-400 font-semibold text-xs md:text-sm lg:text-base">
                                                            {player.level || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center">
                                                        <span className="text-red-400 font-semibold text-xs md:text-sm lg:text-base">
                                                            {player.kill || 0}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
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
                        className="bg-gradient-to-r from-purple-500/50 to-blue-500/50 text-white font-semibold px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        {loading ? 'Refreshing...' : '🔄 Refresh Leaderboard'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurvivalLeaderBoard;