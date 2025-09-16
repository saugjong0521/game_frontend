import { useState } from "react";
import { gameAPI } from "../api/api";
import { PATH } from "../constant/path";
import { useUserinfoStore } from "../store/useUserinfoStore";
import { useGameTokenStore } from "../store/useGameTokenStore";
import { useTicketInfoStore } from "../store/useTicketInfoStore"; // 추가

const useBringTicketInfo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  
  // useUserinfoStore에서 account (address) 가져오기
  const account = useUserinfoStore((state) => state.userInfo.account);
  
  // useGameTokenStore에서 토큰 가져오기
  const { getAccessToken } = useGameTokenStore();
  
  // useTicketInfoStore에서 스토어 업데이트 함수 가져오기 - 추가
  const { setTicketInfo: setStoreTicketInfo } = useTicketInfoStore();

  // 티켓 정보 가져오기
  const bringTicketInfo = async () => {
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
      const response = await gameAPI.get(`${PATH.BRINGTICKET}?wallet_address=${account}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 로컬 state와 Zustand store 모두 업데이트
      setTicketInfo(response.data);
      setStoreTicketInfo(response.data); // 스토어에 저장 - 추가
      
      return response.data;
    } catch (err) {
      console.error('Failed to bring ticket info:', err);
      setError(err.response?.data?.message || 'Failed to bring ticket info');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 상태 초기화
  const reset = () => {
    setLoading(false);
    setError(null);
    setTicketInfo(null);
    setStoreTicketInfo(null); // 스토어도 초기화 - 추가
  };

  return {
    // 상태
    loading,
    error,
    ticketInfo,
    account,
    
    // 메서드
    bringTicketInfo,
    reset
  };
};

export { useBringTicketInfo };