import { useState } from "react";
import { gameAPI } from "../api/api";
import { PATH } from "../constant/path";
import { useUserinfoStore } from "../store/useUserinfoStore";

const useGetUserInfo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  // useUserinfoStore에서 account (address) 가져오기
  const account = useUserinfoStore((state) => state.userInfo.account);

  // 사용자 정보 조회
  const getUserInfo = async () => {
    if (!account) {
      setError('No wallet address. Please enter from App');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await gameAPI.post(PATH.USERINFO, {
        wallet_address: account
      });
      
      setUserInfo(response.data);

      return response.data;
    } catch (err) {
      console.error('Failed to get user info:', err);
      setError(err.response?.data?.message || 'Failed to get user info');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 상태 초기화
  const reset = () => {
    setLoading(false);
    setError(null);
    setUserInfo(null);
  };

  return {
    // 상태
    loading,
    error,
    userInfo,
    account,
    
    // 메서드
    getUserInfo,
    reset
  };
};

export { useGetUserInfo };