import { useState } from "react";
import { PATH } from "../constant/path";
import { useTokenStore } from "../store/useTokenStore";
import { API } from "../api/api";
import { createApiHeaders } from "../utils/deviceInfo";
import { useUserInfoStore } from "../store/useUserinfoStore";

const useGameStart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  
  // useUserinfoStore에서 account (address) 가져오기
  const account = useUserInfoStore((state) => state.userInfo.account);
  
  // useTokenStore에서 토큰 관련 함수들 가져오기
  const { getAuthHeader, isAuthenticated } = useTokenStore();

  // 게임 시작
  const startGame = async () => {


    setLoading(true);
    setError(null);
    
    try {
      // 기기 정보 헤더 생성
      const deviceHeaders = await createApiHeaders();
      
      // Bearer 토큰과 기기 정보 헤더 합치기
      const authHeader = getAuthHeader();
      const headers = {
        ...deviceHeaders,
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      };

      const response = await API.post(PATH.GAMESTART, {
      }, { headers });
      
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
    isAuthenticated,
    
    // 메서드
    startGame,
    reset
  };
};

export { useGameStart };