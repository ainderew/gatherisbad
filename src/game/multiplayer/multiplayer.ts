import io from "socket.io-client";

export class multiplayer {
    socket: SocketIOClient.Socket = io("http://localhost:3000", {
        autoConnect: false,
    });

    constructor() {
        console.log("Multiplayer initialized");
        this.socket.on("connect", () => {
            console.log("Connected to server");
        });
    }

    connectToserver() {
        this.socket.connect();
    }

    disconnectFromServer() {
        this.socket.disconnect();
    }

    public emitPlayerMovement(data: any) {
        this.socket.emit("playerMovement", data);
    }

    public watchNewPlayers(createPlayer: Function, destroyPlayer: Function) {
        this.socket.on("currentPlayers", (players: any) => {
            console.log("Current players:", players);
            Object.keys(players).forEach((id) => {
                console.log("Adding player:", id, players[id]);
                const player = players[id];
                if (id === this.socket.id) {
                    player.opts.isLocal = true;
                }

                createPlayer(player.id, player.x, player.y, player.opts);
            });
        });

        this.socket.on("newPlayer", (data: any) => {
            console.log("New player joined", data);

            createPlayer(data.id, data.x, data.y, data.opts);
        });

        this.socket.on("deletePlayer", (data: { id: string }) => {
            destroyPlayer(data.id);
        });
    }

    public watchPlayerMovement(players: Map<string, any>) {
        this.socket.on("playerMoved", (player: any) => {
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
