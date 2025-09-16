import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserInfoStore = create(
  persist(
    (set, get) => ({
      userInfo: null,

      // 사용자 정보 설정
      setUserInfo: (userInfo) => {
        set({ userInfo });
      },

      // 사용자 정보 제거
      clearUserInfo: () => {
        set({ userInfo: null });
      },

      // 특정 필드 업데이트
      updateUserInfo: (updates) => {
        const currentUserInfo = get().userInfo;
        if (currentUserInfo) {
          set({
            userInfo: {
              ...currentUserInfo,
              ...updates
            }
          });
        }
      },

      // 티켓 정보 업데이트
      updateTicketInfo: (ticketUpdates) => {
        const currentUserInfo = get().userInfo;
        if (currentUserInfo && currentUserInfo.ticket_info) {
          set({
            userInfo: {
              ...currentUserInfo,
              ticket_info: {
                ...currentUserInfo.ticket_info,
                ...ticketUpdates
              }
            }
          });
        }
      },

      // 사용자 ID 가져오기
      getUserId: () => {
        const { userInfo } = get();
        return userInfo?.user_id || null;
      },

      // 티켓 정보 가져오기
      getTicketInfo: () => {
        const { userInfo } = get();
        return userInfo?.ticket_info || null;
      },
    }),
    {
      name: 'userinfo-storage', // localStorage 키 이름
      partialize: (state) => ({
        userInfo: state.userInfo,
      }),
    }
  )
);

export { useUserInfoStore };