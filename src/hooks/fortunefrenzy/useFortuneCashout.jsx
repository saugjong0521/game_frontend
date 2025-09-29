import { useState } from 'react';
import { API } from "@/api";
import { PATH } from '@/constant';
import { useFortuneSessionStore, useTokenStore } from '@/store';
import { createApiHeaders } from "@/utils";

const useFortuneCashout = () => {
  const [loading, setLoading] = useState(false);
  
  const { sessionId } = useFortuneSessionStore();
  const { getAuthHeader } = useTokenStore();

  const cashout = async () => {
    if (!sessionId) {
      console.error('No active session');
      return { success: false, error: 'No active session' };
    }

    setLoading(true);
    
    try {
      const deviceHeaders = await createApiHeaders();
      const authHeader = getAuthHeader();
      
      const headers = {
        ...deviceHeaders,
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      };

      const response = await API.post(
        PATH.FORTUNECASHOUT,
        { session_id: sessionId },
        { headers }
      );

      if (response.data.cashed_out) {
        
        return {
          success: true,
          finalRound: response.data.final_round,
          data: response.data
        };
      }

      return {
        success: false,
        error: 'Cashout failed'
      };
    } catch (error) {
      console.error('Cashout failed:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    cashout,
    loading
  };
};

export default useFortuneCashout;