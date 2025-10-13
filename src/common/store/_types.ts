import { PlayerDto } from "@/game/multiplayer/_types";

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
    playerMap: Record<string, PlayerDto>;
    setPlayerMap: (playerMap: Record<string, PlayerDto>) => void;
    updatePlayerMap: (id: string, updates: Partial<PlayerDto>) => void;
    addPlayerToMap: (id: string, update: PlayerDto) => void;
    removePlayerFromMap: (id: string) => void;
}
