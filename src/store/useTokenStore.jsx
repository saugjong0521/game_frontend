import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useTokenStore = create(
  persist(
    (set, get) => ({
      token: null,
      tokenType: 'bearer',
      isAuthenticated: false,

      // 토큰 설정
      setToken: (tokenData) => {
        set({
          token: tokenData.access_token,
          tokenType: tokenData.token_type || 'bearer',
          isAuthenticated: true,
        });
      },

      // 토큰 제거
      clearToken: () => {
        set({
          token: null,
          tokenType: 'bearer',
          isAuthenticated: false,
        });
      },

      // Authorization 헤더 생성
      getAuthHeader: () => {
        const { token, tokenType } = get();
        return token ? `${tokenType} ${token}` : null;
      },

      // 토큰 유효성 검사 (기본적인 JWT 만료 체크)
      isTokenValid: () => {
        const { token } = get();
        if (!token) return false;
        
        try {
          // JWT payload 디코딩 (간단한 만료 체크)
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          return payload.exp > currentTime;
        } catch (error) {
          console.error('토큰 검증 오류:', error);
          return false;
        }
      },

      // 토큰이 만료되었는지 확인
      isTokenExpired: () => {
        const { token } = get();
        if (!token) return true;
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          return payload.exp <= currentTime;
        } catch (error) {
          console.error('토큰 만료 확인 오류:', error);
          return true;
        }
      },

      // 토큰 만료까지 남은 시간 (초)
      getTokenExpirationTime: () => {
        const { token } = get();
        if (!token) return 0;
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          return Math.max(0, payload.exp - currentTime);
        } catch (error) {
          console.error('토큰 만료 시간 확인 오류:', error);
          return 0;
        }
      },
    }),
    {
      name: 'token-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        token: state.token,
        tokenType: state.tokenType,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useTokenStore };