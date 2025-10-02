import { create } from 'zustand';

const useFortuneUserStore = create((set) => ({
    userInfo: null,
    balance: 0,
    gameStats: null,
    recentTransactions: [],

    setUserInfo: (userInfo) => set({ userInfo }),
    setBalance: (balance) => set({ balance }),
    setGameStats: (gameStats) => set({ gameStats }),
    setRecentTransactions: (transactions) => set({ recentTransactions: transactions }),

    // 초기화 함수
    resetStats: () => set({
        userInfo: null,
        balance: 0,
        gameStats: null,
        recentTransactions: []
    })
}));

export { useFortuneUserStore };