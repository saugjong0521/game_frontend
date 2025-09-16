import { useState } from "react";
import { gameAPI } from "../api/api";
import { useUserinfoStore } from "../store/useUserinfoStore";
import { useGameTokenStore } from "../store/useGameTokenStore";
import { PATH } from "../constant/path";

const useGetUserToken = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // useUserinfoStore에서 account (address) 가져오기
  const account = useUserinfoStore((state) => state.userInfo.account);
  
  // useGameTokenStore에서 토큰 관리 함수들과 현재 토큰 가져오기
  const { gameToken, setGameToken: setStoreGameToken, clearGameToken } = useGameTokenStore();

  // 게임 토큰 발급
  const issueGameToken = async () => {
    if (!account) {
      setError('No wallet address. Please enter from App');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await gameAPI.post(PATH.ISSUEGAMETOKEN, {
        wallet_address: account
      });
      
      // Zustand store에 토큰 저장
      if (response.data.access_token) {
        setStoreGameToken(response.data);
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to issue game token:', err);
      setError(err.response?.data?.message || 'Failed to issue game token');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 상태 초기화
  const reset = () => {
    setLoading(false);
    setError(null);
    clearGameToken(); // store에서 토큰 제거
  };

  return {
    // 상태
    loading,
    error,
    account,
    gameToken,  // store에서 가져온 현재 토큰
    
    // 메서드
    issueGameToken,
    reset
  };
};

export { useGetUserToken };