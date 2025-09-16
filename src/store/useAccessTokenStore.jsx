import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAccessTokenStore = create(
  persist(
    (set) => ({
      getAccessToken: '',
      getAccessTokenName: '',
      setAccessToken: (value) => {
        set(() => ({ getAccessToken: value }));
      },
      setAccessTokenName: (value) => {
        set(() => ({ getAccessTokenName: value }));
      },
    }),
    { name: 'accessToken', storage: createJSONStorage(() => sessionStorage) }
  )
);

export { useAccessTokenStore };
