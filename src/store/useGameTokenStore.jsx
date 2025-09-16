import { create } from 'zustand';

export const useGameTokenStore = create((set, get) => ({
  // 게임 토큰 상태
  gameToken: {
    access_token: '',
    expires_at: null,
    issued_at: null,
  },
  
  // 게임 토큰 설정
  setGameToken: (tokenData) => set({ 
    gameToken: {
      access_token: tokenData.access_token || '',
      expires_at: tokenData.expires_at || null,
      issued_at: new Date().toISOString(),
    }
  }),
  
  // 액세스 토큰만 설정
  setAccessToken: (access_token) => set((state) => ({
    gameToken: {
      ...state.gameToken,
      access_token,
      issued_at: new Date().toISOString(),
    }
  })),
  
  // 토큰 만료 시간 설정
  setExpiresAt: (expires_at) => set((state) => ({
    gameToken: { ...state.gameToken, expires_at }
  })),
  
  // 게임 토큰 초기화
  clearGameToken: () => set({
    gameToken: {
      access_token: '',
      expires_at: null,
      issued_at: null,
    }
  }),
  
  // 토큰 유효성 확인
  isTokenValid: () => {
    const { gameToken } = get();
    if (!gameToken.access_token) return false;
    if (!gameToken.expires_at) return true; // 만료시간이 없으면 유효하다고 가정
    return new Date() < new Date(gameToken.expires_at);
  },
  
  // 게임 토큰 가져오기
  getGameToken: () => get().gameToken,
  
  // 액세스 토큰만 가져오기
  getAccessToken: () => get().gameToken.access_token,
}));