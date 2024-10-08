import { create } from "zustand";

type Store = {
  isHelpOpen: boolean;
  setIsHelpOpen: (value: boolean) => void;
  toggleHelpMenu: () => void;
  isCreditOpen: boolean;
  setToggleCreditMenu: (value: boolean) => void;
  toggleCreditMenu: () => void;
};

type LeaderboardStore = {
  currentPosition: number;
  setCurrentPosition: (value: number) => void;
  bestPosition: number;
  setBestPosition: (value: number) => void;
};

type GameStore = {
  isGameStarted: boolean;
  isGameEnded: boolean;
  xorKey: number[];
  wordPool: string[];
  alreadyFound: string[];
  grid: string[][];
  startTime?: number;
  endTime?: number;
  isLoading: boolean;
  startGame: (
    value: boolean,
    wordPool: string[],
    grid: string[][],
    xorKey: number[]
  ) => void;
  endGame: () => number;
  checkWord: (word: string) => boolean;
  checkAlreadyFound: (word: string) => boolean;
  setLoading: (value: boolean) => void;
  reset: () => void;
};

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  currentPosition: -1,
  setCurrentPosition: (value: number) => set({ currentPosition: value }),
  bestPosition: -1,
  setBestPosition: (value: number) => set({ bestPosition: value }),
}));

export const useStore = create<Store>((set) => ({
  isHelpOpen: false,
  isCreditOpen: false,
  setIsHelpOpen: (value: boolean) => set({ isHelpOpen: value }),
  toggleHelpMenu: () => set((state) => ({ isHelpOpen: !state.isHelpOpen })),
  setToggleCreditMenu: (value: boolean) => set({ isCreditOpen: value }),
  toggleCreditMenu: () => set((state) => ({ isCreditOpen: !state.isCreditOpen })),
}));

export const useGameStore = create<GameStore>((set, state) => ({
  isGameStarted: false,
  isGameEnded: false,
  startTime: 0,
  wordPool: [],
  grid: [],
  endTime: 0,
  xorKey: [],
  startGame: (
    value: boolean,
    wordPool: string[],
    grid: string[][],
    xorKey: number[]
  ) => {
    set({
      isGameStarted: value,
      wordPool,
      startTime: Date.now(),
      grid,
      xorKey,
    });
    useLeaderboardStore.setState({
      currentPosition: -1,
    });
  },
  endGame: () => {
    let endTime = Date.now();
    let dataToSend = {
      time: endTime - (state().startTime || 0),
      foundWords: state().alreadyFound,
    };
    // send encryptedBytes to server
    fetch("/api/leaderboard", {
      method: "POST",
      body: JSON.stringify({ data: dataToSend }),
    })
      .then((res) => res.json())
      .then(({ data }) => {

        let { currentPos, bestPos } = data.position;
        useLeaderboardStore.setState({
          bestPosition: bestPos,
          currentPosition: currentPos,
        });
      });

    set({
      isGameStarted: true,
      isGameEnded: true,
      endTime,
      wordPool: [],
      grid: [],
    });
    return endTime;
  },
  reset: () => {
    set({
      isGameEnded: false,
      isGameStarted: false,
      endTime: 0,
      wordPool: [],
      grid: [],
    });
  },
  alreadyFound: [],
  checkWord: (word: string) => {
    let found = state().wordPool.includes(word);
    console.log(found);
    if (found) {
      set((state) => ({ alreadyFound: [...state.alreadyFound, word] }));
    }
    return found;
  },
  checkAlreadyFound: (word: string) => {
    return state().alreadyFound.includes(word);
  },
  isLoading: false,
  setLoading: (value: boolean) => set({ isLoading: value }),
}));
