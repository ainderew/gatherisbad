import { Scene } from "phaser";
import Player from "../player/Player";
import { Multiplayer } from "../multiplayer/Multiplayer";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    localPlayerId: string;
    players;
    socket;

    constructor() {
        super("Game");
        this.players = new Map();
        this.socket = new Multiplayer();
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");
        this.load.image("star", "star.png");

        this.load.spritesheet(
            "char",
            "characters/Characters/Soldier/Soldier/Soldier.png",
            {
                frameWidth: 100,
                frameHeight: 100,
            },
        );
        this.load.spritesheet(
            "char-walk",
            "characters/Characters/Soldier/Soldier/Soldier-Walk.png",
            {
                frameWidth: 100,
                frameHeight: 100,
            },
        );

        this.load.once("complete", () => {
            console.log("All assets loaded");
            this.socket.connectToserver();
        });
    }

    create() {
        this.socket.watchNewPlayers(
            this.createPlayer.bind(this),
            this.destroyPlayer.bind(this),
        );
        this.socket.watchPlayerMovement(this.players);

        const local = this.players.get(this.socket.socket.id);
        if (!local) {
            console.error("Local player not found!");
            return;
        }
        this.localPlayerId = local.id;
        this.cameras.main.startFollow(local, true, 1, 1);

        this.background = this.add.image(512, 384, "background");
        console.log("Game scene created");
    }

    public createPlayer(
        id: string,
        x: number,
        y: number,
        opts: { isLocal: boolean },
    ): void {
        if (this.players.has(id)) {
            return this.players.get(id);
        }

        const p = new Player(this, id, x, y, "char", {
            isLocal: opts.isLocal,
        });

        this.players.set(id, p);

        // Example physics collision with world bounds or layers:
        // this.physics.add.collider(p, someLayer);
    }

    public destroyPlayer(id: string): void {
        const p = this.players.get(id);
        if (p) {
            p.destroy();
            this.players.delete(id);
        }
    }

    public update(time: number, delta: number) {
        for (const p of this.players.values()) {
            p.update(time, delta);

            if (p.isLocal) {
                this.socket.emitPlayerMovement({
                    x: p.x,
                    y: p.y,
                    vx: p.vx,
                    vy: p.vy,
                    id: this.localPlayerId,
                    opts: { isLocal: true },
                });
            }
        }
    }
}
