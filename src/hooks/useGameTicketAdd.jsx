import { useState } from "react";
import { PATH } from "@/constant";
import { useTokenStore } from "@/store";
import { API } from "@/api";
import { createApiHeaders } from "@/utils";

// 티켓 타입 상수
export const TICKET_TYPES = {
  ONE: 'ONE',
  DAY: 'DAY', 
  WEEK: 'WEEK',
  MONTH: 'MONTH'
};

const useGameTicketAdd = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState(null);
  
  // Store에서 필요한 함수들 가져오기
  const { getAuthHeader, isAuthenticated } = useTokenStore();

  // 티켓 추가
  const addTicket = async (userId, ticketType) => {
    if (!isAuthenticated) {
      setError('Authentication required. Please sign in first.');
      return false;
    }

    if (!userId) {
      setError('User ID is required.');
      return false;
    }

    // 티켓 타입 유효성 검사
    if (!Object.values(TICKET_TYPES).includes(ticketType)) {
      setError(`Invalid ticket type. Must be one of: ${Object.values(TICKET_TYPES).join(', ')}`);
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setResponseData(null);
    
    try {
      // 기기 정보 헤더 생성
      const deviceHeaders = await createApiHeaders();
      
      // Bearer 토큰 추가
      const authHeader = getAuthHeader();
      const headers = {
        ...deviceHeaders,
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      };

      // 요청 본문 생성
      const requestBody = {
        user_id: userId,
        ticket: ticketType
      };

      const response = await API.post(PATH.TICKETADD, requestBody, { headers });
      
      setResponseData(response.data);
      setSuccess(true);
      return response.data;
      
    } catch (err) {
      console.error('Failed to add ticket:', err);
      setError(err.response?.data?.message || 'Failed to add ticket');
      
      // 401 Unauthorized 에러 시 인증 문제로 처리
      if (err.response?.status === 401) {
        setError('Authentication expired. Please sign in again.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 각 티켓 타입별 편의 함수들
  const addOneTicket = (userId) => addTicket(userId, TICKET_TYPES.ONE);
  const addDayTicket = (userId) => addTicket(userId, TICKET_TYPES.DAY);
  const addWeekTicket = (userId) => addTicket(userId, TICKET_TYPES.WEEK);
  const addMonthTicket = (userId) => addTicket(userId, TICKET_TYPES.MONTH);

  // 상태 초기화
  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setResponseData(null);
  };

  return {
    // 상태
    loading,
    error,
    success,
    responseData,
    isAuthenticated,
    
    // 메서드
    addTicket,
    addOneTicket,
    addDayTicket,
    addWeekTicket,
    addMonthTicket,
    reset,
    
    // 상수
    TICKET_TYPES
  };
};

export { useGameTicketAdd };