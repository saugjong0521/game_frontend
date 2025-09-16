import { create } from 'zustand';

export const useUserinfoStore = create((set, get) => ({
  // 사용자 정보 상태
  userInfo: {
    userId: '',
    name: '',
    account: '',
    symbol: '',
    email: '',
    loginTime: 0,
  },
  
  // 사용자 정보 설정
  setUserInfo: (userInfo) => set({ userInfo }),
  
  // 개별 필드 업데이트
  setUserId: (userId) => set((state) => ({
    userInfo: { ...state.userInfo, userId }
  })),
  
  setName: (name) => set((state) => ({
    userInfo: { ...state.userInfo, name }
  })),
  
  setAccount: (account) => set((state) => ({
    userInfo: { ...state.userInfo, account }
  })),
  
  setSymbol: (symbol) => set((state) => ({
    userInfo: { ...state.userInfo, symbol }
  })),
  
  setEmail: (email) => set((state) => ({
    userInfo: { ...state.userInfo, email }
  })),
  
  setLoginTime: (loginTime) => set((state) => ({
    userInfo: { ...state.userInfo, loginTime }
  })),
  
  // 사용자 정보 초기화
  clearUserInfo: () => set({
    userInfo: {
      userId: '',
      name: '',
      account: '',
      symbol: '',
      email: '',
      loginTime: 0,
    }
  }),
  
  // 사용자 정보 가져오기
  getUserInfo: () => get().userInfo,
}));