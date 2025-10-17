import { Player } from "@/game/player/player";

export type User = {
    name: string;
    producerIds: string[];
};

export interface UserStore {
    user: User;
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void;
}

export interface PlayersStore {
    playerMap: Record<string, Player>;
    localPlayerId: string | null;
    setPlayerMap: (playerMap: Record<string, Player>) => void;
    setLocalPlayerId: (playerId: string) => void;
    updatePlayerMap: (id: string, updates: Partial<Player>) => void;
    addPlayerToMap: (id: string, update: Player) => void;
    removePlayerFromMap: (id: string) => void;
}
