import { useState } from 'react';
import { API } from "@/api";
import { PATH } from '@/constant';
import { useFortuneBoxStore, useFortuneSessionStore, useTokenStore } from '@/store';
import { createApiHeaders } from "@/utils";

const useFortuneStart = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { setRounds } = useFortuneBoxStore();
    const { sessionId, setSessionId, setCurrentRound } = useFortuneSessionStore();
    const { getAuthHeader, isAuthenticated } = useTokenStore();

    const startGame = async (betAmount) => {
        setLoading(true);
        try {
            const deviceHeaders = await createApiHeaders();
            const authHeader = getAuthHeader();
            
            const headers = {
                ...deviceHeaders,
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            };

            const response = await API.post(PATH.STARTFORTUNE, {
                value: betAmount
            }, { headers });

            // session store에 저장
            setSessionId(response.data.session_id);
            setCurrentRound(response.data.round);
            
            // box store에 라운드 정보 저장
            setRounds(response.data.rounds_info.reverse());
            setGameStarted(true);

            return response.data;
        } catch (error) {
            console.error('Game start failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        gameStarted,
        sessionId,
        loading,
        startGame,
        setGameStarted
    };
};

export default useFortuneStart;