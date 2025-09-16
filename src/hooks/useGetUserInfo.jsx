import { useState } from "react";
import { PATH } from "../constant/path";
import { useTokenStore } from "../store/useTokenStore";
import { API } from "../api/api";
import { createApiHeaders } from "../utils/deviceInfo";
import { useUserInfoStore } from "../store/useUserinfoStore";

const useGetUserInfo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Store에서 필요한 함수들 가져오기
  const { setUserInfo, clearUserInfo } = useUserInfoStore();
  const { getAuthHeader, isAuthenticated } = useTokenStore();
  
  // Store에 저장된 사용자 정보 가져오기
  const userInfo = useUserInfoStore((state) => state.userInfo);

  // 사용자 정보 조회
  const getUserInfo = async () => {
    if (!isAuthenticated) {
      setError('Authentication required. Please sign in first.');
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

      const response = await API.get(PATH.USERINFO, { headers });
      
      // Store에 사용자 정보 저장
      setUserInfo(response.data);

      return response.data;
    } catch (err) {
      console.error('Failed to get user info:', err);
      setError(err.response?.data?.message || 'Failed to get user info');
      
      // 401 Unauthorized 에러 시 토큰 정리
      if (err.response?.status === 401) {
        clearUserInfo();
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 상태 초기화
  const reset = () => {
    setLoading(false);
    setError(null);
    clearUserInfo();
  };

  return {
    // 상태
    loading,
    error,
    userInfo,
    isAuthenticated,
    
    // 메서드
    getUserInfo,
    reset
  };
};

export { useGetUserInfo };