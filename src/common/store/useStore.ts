import { create } from "zustand";
import { User, UserStore } from "./_types";

const useUserStore = create<UserStore>((set) => ({
    user: { name: "", producerIds: [] },
    setUser: (user: User) => set({ user }),
    updateUser: (updates: Partial<User>) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
}));

// const usePlayerMapStore = create<Map<string,string[]>>((set) => ({
//     playerMap: new Map(),
//         setPlayerMap: (playerMap: Map<string,string[]) => set( playerMap),
//
// }))

export default useUserStore;
