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

  // 수정이 필요한 부분:
  getCurrentData: () => {
    const state = get();
    const data = state.currentType === 'TopScore' ? state.topScoreData : state.mostPlayData;
    // data가 이미 배열이므로 data.items가 아닌 data를 직접 반환해야 함
    return data; // data.items 제거
  },

  getDataByType: (type) => {
    const state = get();
    const data = type === 'TopScore' ? state.topScoreData : state.mostPlayData;
    return data; // data.items 제거 필요하다면
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