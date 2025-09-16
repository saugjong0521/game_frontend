import { create } from 'zustand';

const useVerifyStore = create((set) => ({
  getIsVerify: true,
  setIsVerify: (value) => set((state) => ({ ...state, getIsVerify: value })),
}));

export { useVerifyStore };
