import { create } from "zustand";
import { PlayersStore } from "./_types";
import { Player } from "@/game/player/player";

const usePlayersStore = create<PlayersStore>((set) => ({
    playerMap: {} as Record<string, Player>,
    localPlayerId: null,

    setPlayerMap: (playerMap: Record<string, Player>) => set({ playerMap }),
    setLocalPlayerId: (playerId: string) => set({ localPlayerId: playerId }),

    updatePlayerMap: (id: string, updates: Partial<Player>) =>
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

    addPlayerToMap: (id: string, player: Player) =>
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
