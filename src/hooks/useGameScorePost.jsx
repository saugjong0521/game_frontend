import { useState } from "react";
import { gameAPI } from "../api/api";
import { PATH } from "../constant/path";
import { useUserinfoStore } from "../store/useUserinfoStore";
import { useGameTokenStore } from "../store/useGameTokenStore";

const useGameScorePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  
  // useUserinfoStore에서 account (address) 가져오기
  const account = useUserinfoStore((state) => state.userInfo.account);
  
  // useGameTokenStore에서 토큰 가져오기
  const { getAccessToken } = useGameTokenStore();

  // 게임 점수 저장
  const postGameScore = async (kill, level) => {
    if (!account) {
      setError('No wallet address. Please enter from App');
      return null;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('No wallet address. Please enter from App');
      return null;
    }

    if (kill === undefined || level === undefined) {
      setError('Kill and level are required');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await gameAPI.post(PATH.SCOREPOST, {
        wallet_address: account,
        kill: kill,
        level: level
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setScoreResult(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to save score:', err);
      setError(err.response?.data?.message || 'Failed to save score');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 상태 초기화
  const reset = () => {
    setLoading(false);
    setError(null);
    setScoreResult(null);
  };

  return {
    // 상태
    loading,
    error,
    scoreResult,
    account,
    
    // 메서드
    postGameScore,
    reset
  };
};

export { useGameScorePost };