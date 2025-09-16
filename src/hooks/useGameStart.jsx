import { useState } from "react";
import { gameAPI } from "../api/api";
import { PATH } from "../constant/path";
import { useUserinfoStore } from "../store/useUserinfoStore";
import { useGameTokenStore } from "../store/useGameTokenStore";

const useGameStart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  
  // useUserinfoStore에서 account (address) 가져오기
  const account = useUserinfoStore((state) => state.userInfo.account);
  
  // useGameTokenStore에서 토큰 가져오기
  const { getAccessToken } = useGameTokenStore();

  // 게임 시작
  const startGame = async () => {
    if (!account) {
      setError('No wallet address. Please enter from App');
      return null;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('No wallet address. Please enter from App');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await gameAPI.post(PATH.GAMESTART, {
        wallet_address: account
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setGameSession(response.data);
      return response.data;
    } catch (err) {
      console.error('No ticket available.');
      setError('No ticket available.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 상태 초기화
  const reset = () => {
    setLoading(false);
    setError(null);
    setGameSession(null);
  };

  return {
    // 상태
    loading,
    error,
    gameSession,
    account,
    
    // 메서드
    startGame,
    reset
  };
};

export { useGameStart };