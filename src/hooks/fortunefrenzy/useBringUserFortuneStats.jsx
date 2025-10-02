import { useState } from 'react';
import { API } from "@/api";
import { PATH } from '@/constant';
import { useFortuneUserStore, useTokenStore } from '@/store';
import { createApiHeaders } from "@/utils";

const useBringUserFortuneStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { setBalance, setUserInfo, setGameStats, setRecentTransactions } = useFortuneUserStore();
    const { getAuthHeader } = useTokenStore();

    const fetchUserStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const deviceHeaders = await createApiHeaders();
            const authHeader = getAuthHeader();
            
            const headers = {
                ...deviceHeaders,
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            };

            const response = await API.get(PATH.FORTUNEUSERSTATS, { headers });

            // store에 데이터 저장
            setUserInfo(response.data.user_info);
            setBalance(response.data.user_info.balance);
            setGameStats(response.data.game_stats);
            setRecentTransactions(response.data.recent_transactions);

            return response.data;
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchUserStats
    };
};

export default useBringUserFortuneStats;