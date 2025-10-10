import { useState } from 'react';
import { API } from "@/api";
import { PATH } from '@/constant';
import { useFortuneBoxStore, useFortuneSessionStore, useTokenStore } from '@/store';
import { createApiHeaders } from "@/utils";

const useCheckFortuneSession = () => {
    const [loading, setLoading] = useState(false);

    const { setSessionId, setCurrentRound } = useFortuneSessionStore();
    const { setRounds, setMinePosition, setSelectedBox } = useFortuneBoxStore();
    const { getAuthHeader } = useTokenStore();

    const checkSession = async () => {
        setLoading(true);
        try {
            const deviceHeaders = await createApiHeaders();
            const authHeader = getAuthHeader();

            const headers = {
                ...deviceHeaders,
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            };

            const res = await API.get(PATH.CHECKFORTUNESESSION, { headers });

            if (res?.data?.has_active_session) {
                const session = res.data;

                // ✅ 세션 정보 저장
                setSessionId(session.session_id);
                setCurrentRound(session.current_round);

                // ✅ 라운드 정보 저장 (역순으로 맞춰서 아래→위 구조 유지)
                setRounds(session.rounds_info.reverse());

                // ✅ 지뢰 위치 적용
                session.rounds_info.forEach((round) => {
                    if (round.mine_position !== undefined) {
                        setMinePosition(round.round, round.mine_position);
                    }
                });

                // ✅ 선택 위치 적용
                session.rounds_info.forEach((round) => {
                    if (round.user_position !== undefined) {
                        setSelectedBox(round.round, round.user_position);
                    }
                });

                console.log('✅ Active session restored:', session.session_id);
                return session;
            } else {
                console.log('ℹ️ No active fortune session found.');
                return null;
            }
        } catch (error) {
            console.error('❌ Failed to check fortune session:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { checkSession, loading };
};

export default useCheckFortuneSession;
