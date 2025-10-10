import { create } from "zustand";
import { User, UserStore } from "./_types";

const useUserStore = create<UserStore>((set) => ({
    user: { name: "" },
    setUser: (user: User) => set({ user }),
    updateUser: (updates: Partial<User>) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
}));

export default useUserStore;
