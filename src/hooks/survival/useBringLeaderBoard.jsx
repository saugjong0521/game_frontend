import { API } from "@/api";
import { PATH } from "@/constant";
import { useLeaderBoardStore } from "@/store";

const useBringLeaderBoard = () => {
  // Zustand 스토어에서 상태와 액션 가져오기
  const {
    loading,
    error,
    topScoreData,
    mostPlayData,
    currentType,
    setLoading,
    setError,
    setCurrentType,
    setDataByType,
    getCurrentData,
    getDataByType,
    clearError
  } = useLeaderBoardStore();

  // 리더보드 정보 가져오기
  const bringLeaderBoard = async (type = 'TopScore') => {
    // type 유효성 검사
    const validTypes = ['TopScore', 'MostPlay'];
    if (!validTypes.includes(type)) {
      setError('Invalid leaderboard type. Must be TopScore or MostPlay');
      return null;
    }

    setLoading(true);
    setError(null);
    setCurrentType(type);
    
    try {
      const response = await API.get(`${PATH.LEADERBOARD}?type=${type}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // 스토어에 데이터 저장
      setDataByType(type, response.data);
      
      return response.data;
    } catch (err) {
      console.error(`Failed to bring leaderboard (${type}):`, err);
      setError(`Failed to bring leaderboard (${type})`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    // 상태
    loading,
    error,
    topScoreData,
    mostPlayData,
    currentType,
    
    // 현재 선택된 타입의 데이터
    currentData: getCurrentData(),
    
    // 메서드
    bringLeaderBoard,
    setCurrentType,
    getDataByType,
    clearError
  };
};

export { useBringLeaderBoard };