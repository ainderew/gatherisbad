import io from "socket.io-client";
import { PlayerInterface } from "../player/_types";
import { PlayerDto } from "./_types";
import { CONFIG } from "@/common/utils/config";
import useUserStore from "@/common/store/useStore";

export class Multiplayer {
    socket: SocketIOClient.Socket = io(CONFIG.SERVER_URL, {
        autoConnect: false,
    });

    constructor() {
        const name = useUserStore.getState().user.name;
        console.log("Multiplayer initialized");
        this.socket.on("connect", () => {
            console.log("Connected to server");

            console.log("Connecting as: ", name);
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
                    }

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
            console.log("New player joined", data);

            createPlayer(data.id, data.name, data.x, data.y, data.opts);
        });

        this.socket.on("deletePlayer", (data: { id: string }) => {
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
            }
        });
    }
}
