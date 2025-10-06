import { Scene } from "phaser";
import { Player } from "../player/player";
import { Multiplayer } from "../multiplayer/multiplayer";

export class Game extends Scene {
    //Game setup
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    // Players
    localPlayerId: string;
    players;

    playersLayer: Phaser.Physics.Arcade.Group;

    // Multiplayer Logic
    multiplayer;
    lastTick: number = 0;
    Hz: number = 1000 / 30; // 20hz

    constructor() {
        super("Game");
        this.players = new Map();
        this.multiplayer = new Multiplayer();
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");
        this.load.image("star", "star.png");
        this.load.image("background", "theoria.jpg");

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
            this.multiplayer.connectToserver();
        });
    }

    create() {
        this.startAnimation();
        this.multiplayer.watchNewPlayers(
            this.createPlayer.bind(this),
            this.destroyPlayer.bind(this),
        );
        this.multiplayer.watchPlayerMovement(this.players);

        this.background = this.add.image(512, 384, "background");

        // Camera setup
        // this.cameras.main.setBounds(0, 0, 1024, 768);
        this.physics.world.setBounds(0, 0, 1024, 768);

        this.initializeCollisions();
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

        const p = new Player(this, id, x, y, "char-walk", {
            isLocal: opts.isLocal,
        });

        this.players.set(id, p);
        this.playersLayer.add(p);

        // Example physics collision with world bounds or layers:
        const local = this.players.get(this.multiplayer.socket.id);
        if (!local) {
            console.error("Local player not found!");
            return;
        }
        this.localPlayerId = local.id;
        this.cameras.main.startFollow(local, true, 0.1, 0.1);
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
                if (time - this.lastTick > this.Hz) {
                    this.multiplayer.emitPlayerMovement({
                        x: p.x,
                        y: p.y,
                        vx: p.vx,
                        vy: p.vy,
                        id: this.localPlayerId,
                        opts: { isLocal: true },
                    });

                    this.lastTick = time;
                }
            }
        }
    }

    private startAnimation() {
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("char", {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("char-walk", {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
    }

    private initializeCollisions() {
        // TODO: organize initialization code
        this.playersLayer = this.physics.add.group();

        // Turned off collisions between players for now
        // It makes it harder to move around
        // this.physics.add.collider(this.playersLayer, this.playersLayer);
        // this.playersLayer.runChildUpdate = true;
    }
}
