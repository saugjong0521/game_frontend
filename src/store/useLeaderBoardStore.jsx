import { create } from 'zustand';

const useLeaderBoardStore = create((set, get) => ({
  // 상태
  loading: false,
  error: null,
  
  // Survival 게임 데이터
  topScoreData: null,
  mostPlayData: null,
  
  // Fortune 게임 데이터
  bestRoundData: null,
  totalGamesData: null,
  
  currentType: null,
  currentGame: null, // 'survival' or 'fortune'

  // 로딩 상태 설정
  setLoading: (loading) => set({ loading }),

  // 에러 상태 설정
  setError: (error) => set({ error }),

  // 현재 게임 및 타입 설정
  setCurrentGameAndType: (game, type) => set({ 
    currentGame: game, 
    currentType: type 
  }),

  // 범용 데이터 설정 함수
  setData: (game, type, data) => {
    if (game === 'survival') {
      if (type === 'TopScore') {
        set({ topScoreData: data });
      } else if (type === 'MostPlay') {
        set({ mostPlayData: data });
      }
    } else if (game === 'fortune') {
      if (type === 'BestRound') {
        set({ bestRoundData: data });
      } else if (type === 'TotalGames') {
        set({ totalGamesData: data });
      }
    }
  },

  // 현재 선택된 데이터 가져오기
  getCurrentData: () => {
    const state = get();
    const { currentGame, currentType } = state;
    
    if (currentGame === 'survival') {
      return currentType === 'TopScore' ? state.topScoreData : state.mostPlayData;
    } else if (currentGame === 'fortune') {
      return currentType === 'BestRound' ? state.bestRoundData : state.totalGamesData;
    }
    return null;
  },

  // 특정 게임/타입의 데이터 가져오기
  getData: (game, type) => {
    const state = get();
    
    if (game === 'survival') {
      return type === 'TopScore' ? state.topScoreData : state.mostPlayData;
    } else if (game === 'fortune') {
      return type === 'BestRound' ? state.bestRoundData : state.totalGamesData;
    }
    return null;
  },

  // 모든 상태 초기화
  reset: () => set({
    loading: false,
    error: null,
    topScoreData: null,
    mostPlayData: null,
    bestRoundData: null,
    totalGamesData: null,
    currentType: null,
    currentGame: null
  }),

  // 특정 게임의 데이터만 초기화
  resetGame: (game) => {
    if (game === 'survival') {
      set({ topScoreData: null, mostPlayData: null });
    } else if (game === 'fortune') {
      set({ bestRoundData: null, totalGamesData: null });
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));

export { useLeaderBoardStore };