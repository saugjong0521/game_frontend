import { create } from 'zustand';

export const useFortuneBoxStore = create((set) => ({
  rounds: [],
  selectedBoxes: {}, // { roundNumber: boxIndex }
  minePositions: {}, // { roundNumber: mineIndex } 추가
  
  setRounds: (rounds) => set({ rounds }),
  
  addRounds: (newRounds) => set((state) => {
    const existingRoundNumbers = new Set(state.rounds.map(r => r.round));
    const uniqueNewRounds = newRounds.filter(
      round => !existingRoundNumbers.has(round.round)
    );
    
    return {
      rounds: [...uniqueNewRounds, ...state.rounds]
    };
  }),
  
  setSelectedBox: (roundNumber, boxIndex) => set((state) => ({
    selectedBoxes: {
      ...state.selectedBoxes,
      [roundNumber]: boxIndex
    }
  })),
  
  setMinePosition: (roundNumber, mineIndex) => set((state) => ({
    minePositions: {
      ...state.minePositions,
      [roundNumber]: mineIndex
    }
  })),
  
  clearRounds: () => set({ 
    rounds: [],
    selectedBoxes: {},
    minePositions: {}
  })
}));