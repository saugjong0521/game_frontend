import { create } from 'zustand';

const useLeaderBoardStore = create((set, get) => ({
  // 상태
  loading: false,
  error: null,
  topScoreData: null,
  mostPlayData: null,
  currentType: 'TopScore',
  
  // 로딩 상태 설정
  setLoading: (loading) => set({ loading }),
  
  // 에러 상태 설정
  setError: (error) => set({ error }),
  
  // 현재 타입 설정
  setCurrentType: (type) => set({ currentType: type }),
  
  // TopScore 리더보드 데이터 설정
  setTopScoreData: (data) => set({ topScoreData: data }),
  
  // MostPlay 리더보드 데이터 설정
  setMostPlayData: (data) => set({ mostPlayData: data }),
  
  // 타입에 따른 현재 데이터 가져오기
  getCurrentData: () => {
    const state = get();
    return state.currentType === 'TopScore' ? state.topScoreData : state.mostPlayData;
  },
  
  // 특정 타입 데이터 가져오기
  getDataByType: (type) => {
    const state = get();
    return type === 'TopScore' ? state.topScoreData : state.mostPlayData;
  },
  
  // 타입에 따른 데이터 설정
  setDataByType: (type, data) => {
    if (type === 'TopScore') {
      set({ topScoreData: data });
    } else if (type === 'MostPlay') {
      set({ mostPlayData: data });
    }
  },
  
  // 모든 상태 초기화
  reset: () => set({
    loading: false,
    error: null,
    topScoreData: null,
    mostPlayData: null,
    currentType: 'TopScore'
  }),
  
  // 특정 타입 데이터만 초기화
  resetDataByType: (type) => {
    if (type === 'TopScore') {
      set({ topScoreData: null });
    } else if (type === 'MostPlay') {
      set({ mostPlayData: null });
    }
  },
  
  // 에러 초기화
  clearError: () => set({ error: null }),
}));

export { useLeaderBoardStore };