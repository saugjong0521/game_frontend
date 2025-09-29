import { useState } from 'react';
import { API } from "@/api";
import { PATH } from '@/constant';
import { useFortuneBoxStore, useFortuneSessionStore, useTokenStore } from '@/store';
import { createApiHeaders } from "@/utils";

const useSelectBox = () => {
  const [loading, setLoading] = useState(false);
  
  const { addRounds, setSelectedBox: storeSelectedBox, setMinePosition: storeMinePosition } = useFortuneBoxStore();
  const { sessionId, currentRound, setCurrentRound } = useFortuneSessionStore();
  const { getAuthHeader } = useTokenStore();

  const selectBox = async (boxIndex) => {
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
        PATH.SELECTFORTUNE, 
        {
          session_id: sessionId,
          box_index: boxIndex
        },
        { headers }
      );

      // 선택한 박스와 지뢰 위치 저장
      storeSelectedBox(currentRound, boxIndex);
      storeMinePosition(currentRound, response.data.mine_position);

      if (response.data.success) {
        // 성공: 다음 라운드로 진행
        setCurrentRound(response.data.round);
        
        // 새로운 10라운드 정보 추가
        if (response.data.next_rounds_info) {
          addRounds(response.data.next_rounds_info.reverse());
        }
        
        return {
          success: true,
          minePosition: response.data.mine_position,
          data: response.data
        };
      } else {
        // 실패: 게임 오버
        return {
          success: false,
          minePosition: response.data.mine_position,
          gameOver: true
        };
      }
    } catch (error) {
      console.error('Box select failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectBox,
    loading
  };
};

export default useSelectBox;