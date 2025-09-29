import { create } from 'zustand';

export const useFortuneSessionStore = create((set) => ({
  sessionId: null,
  currentRound: 1,
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  setCurrentRound: (round) => set({ currentRound: round }),
  
  clearSession: () => set({ 
    sessionId: null, 
    currentRound: 1 
  })
}));