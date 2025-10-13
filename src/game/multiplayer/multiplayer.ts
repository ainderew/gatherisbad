import io from "socket.io-client";
import { PlayerInterface } from "../player/_types";
import { PlayerDto } from "./_types";
import { CONFIG } from "@/common/utils/config";
import useUserStore from "@/common/store/useStore";
import usePlayersStore from "@/common/store/playerStore";

export class Multiplayer {
    socket: SocketIOClient.Socket = io(CONFIG.SERVER_URL, {
        autoConnect: false,
    });

    constructor() {
        const name = useUserStore.getState().user.name;
        this.socket.on("connect", () => {
            this.socket.emit("playerJoined", { playerName: name });
        });
    }

    connectToserver() {
        this.socket.connect();
    }

    disconnectFromServer() {
        this.socket.disconnect();
    }

    public emitPlayerMovement(data: PlayerDto) {
        this.socket.emit("playerMovement", data);
    }

    public watchNewPlayers(
        createPlayer: (
            id: string,
            name: string | undefined,
            x: number,
            y: number,
            opts: { isLocal: boolean },
        ) => void,
        destroyPlayer: (id: string) => void,
    ) {
        this.socket.on(
            "currentPlayers",
            (players: Record<string, PlayerDto>) => {
                Object.keys(players).forEach((id) => {
                    const player: PlayerDto = players[id];
                    if (id === this.socket.id) {
                        player.opts!.isLocal = true;
                        player.name = "You";
                    }

                    usePlayersStore
                        .getState()
                        .addPlayerToMap(id, player as PlayerDto);

                    createPlayer(
                        player.id,
                        player.name,
                        player.x,
                        player.y,
                        player.opts,
                    );
                });
            },
        );

        this.socket.on("newPlayer", (data: PlayerDto) => {
            usePlayersStore
                .getState()
                .addPlayerToMap(data.id, data as PlayerDto);

            createPlayer(data.id, data.name, data.x, data.y, data.opts);
        });

        this.socket.on("deletePlayer", (data: { id: string }) => {
            usePlayersStore.getState().removePlayerFromMap(data.id);
            destroyPlayer(data.id);
        });
    }

    public watchPlayerMovement(players: Map<string, PlayerInterface>) {
        this.socket.on("playerMoved", (player: PlayerDto) => {
            const targetPlayer = players.get(player.id);
            if (targetPlayer) {
                targetPlayer.targetPos = {
                    x: player.x,
                    y: player.y,
                    vx: player.vx,
                    vy: player.vy,
                    t: Date.now(),
                };

                targetPlayer.isAttacking = player.isAttacking;
            }
        });
    }
}
