import { create } from "zustand";
import { PlayersStore } from "./_types";
import { PlayerDto } from "@/game/multiplayer/_types";

const usePlayersStore = create<PlayersStore>((set) => ({
    playerMap: {} as Record<string, PlayerDto>,

    setPlayerMap: (playerMap: Record<string, PlayerDto>) => set({ playerMap }),

    updatePlayerMap: (id: string, updates: Partial<PlayerDto>) =>
        set((state) => {
            const existing = state.playerMap[id];
            if (!existing) {
                return {};
            }

            Object.assign(existing, updates);

            return {
                playerMap: {
                    ...state.playerMap,
                    [id]: existing,
                },
            };
        }),

    addPlayerToMap: (id: string, player: PlayerDto) =>
        set((state) => ({
            playerMap: {
                ...state.playerMap,
                [id]: player,
            },
        })),

    removePlayerFromMap: (id: string) =>
        set((state) => {
            const { ...rest } = state.playerMap;
            delete rest[id];
            return { playerMap: rest };
        }),
}));

export default usePlayersStore;
