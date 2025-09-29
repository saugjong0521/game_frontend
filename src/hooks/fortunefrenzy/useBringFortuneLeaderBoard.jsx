import { API } from "@/api";
import { PATH } from "@/constant";
import { useLeaderBoardStore } from "@/store";

const useBringFortuneLeaderBoard = () => {
  const GAME_TYPE = 'fortune';
  
  // 통합 Zustand 스토어에서 상태와 액션 가져오기
  const {
    loading,
    error,
    currentType,
    setLoading,
    setError,
    setCurrentGameAndType,
    setData,
    getCurrentData,
    getData,
    clearError
  } = useLeaderBoardStore();

  // Fortune 리더보드 정보 가져오기
  const bringFortuneLeaderBoard = async (type = 'BestRound') => {
    // type 유효성 검사
    const validTypes = ['BestRound', 'TotalGames'];
    if (!validTypes.includes(type)) {
      setError('Invalid leaderboard type. Must be BestRound or TotalGames');
      return null;
    }

    setLoading(true);
    setError(null);
    setCurrentGameAndType(GAME_TYPE, type);
    
    try {
      const response = await API.get(`${PATH.FORTUNELEADERBOARD}?type=${type}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // 스토어에 데이터 저장 (게임 타입과 함께)
      setData(GAME_TYPE, type, response.data);
      
      return response.data;
    } catch (err) {
      console.error(`Failed to bring Fortune leaderboard (${type}):`, err);
      setError(`Failed to bring Fortune leaderboard (${type})`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    // 상태
    loading,
    error,
    currentType,
    
    // 현재 선택된 타입의 데이터
    currentData: getCurrentData(),
    
    // 메서드
    bringFortuneLeaderBoard,
    setCurrentType: (type) => setCurrentGameAndType(GAME_TYPE, type),
    getDataByType: (type) => getData(GAME_TYPE, type),
    clearError
  };
};

export { useBringFortuneLeaderBoard };