import { useState } from "react";
import { PATH } from "../constant/path";
import { useTokenStore } from "../store/useTokenStore";
import { API } from "../api/api";
import { createApiHeaders } from "../utils/deviceInfo";

const useGameScorePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  
  // useTokenStore에서 토큰 관련 함수들 가져오기
  const { getAuthHeader, isAuthenticated } = useTokenStore();

  // 게임 점수 저장
  const postGameScore = async (kill, level) => {
    if (!isAuthenticated) {
      setError('Authentication required. Please sign in first');
      return null;
    }

    if (kill === undefined || level === undefined) {
      setError('Kill and level are required');
      return null;
    }

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

      const response = await API.post(PATH.SCOREPOST, {
        kill: kill,
        level: level
      }, { headers });
      
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
    isAuthenticated,
    
    // 메서드
    postGameScore,
    reset
  };
};

export { useGameScorePost };