import { create } from 'zustand';

const useTicketInfoStore = create((set, get) => ({
  ticketInfo: null,
  
  // 티켓 정보 설정
  setTicketInfo: (ticketInfo) => set({ ticketInfo }),
  
  // 티켓 정보 제거
  clearTicketInfo: () => set({ ticketInfo: null }),
  
  // 티켓 정보 가져오기
  getTicketInfo: () => get().ticketInfo,
}));

export { useTicketInfoStore };