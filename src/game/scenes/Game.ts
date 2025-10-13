import { Scene } from "phaser";
import { Player } from "../player/player";
import { Multiplayer } from "../multiplayer/multiplayer";
import {
    AttackAnimationKeys,
    IdleAnimationKeys,
    SpriteKeys,
    WalkAnimationKeys,
} from "../commmon/enums";

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

        this.load.image("tiles1", "tiles1.png");
        this.load.image("tiles2", "tiles2.png");
        this.load.tilemapTiledJSON("map", "map1.json");

        this.load.image("logo", "logo.png");
        this.load.image("logo", "logo.png");
        this.load.image("star", "star.png");
        this.load.image("background", "theoria.jpg");
        this.load.image("active-voice", "sound.png");

        this.load.spritesheet(
            SpriteKeys.ORC,
            "characters/Characters/Orc/OrcWithShadow/Orc.png",
            {
                frameWidth: 100,
                frameHeight: 100,
            },
        );

        this.load.spritesheet(
            SpriteKeys.SOLDIER,
            "characters/Characters/Soldier/SoldierWithShadow/Soldier.png",
            {
                frameWidth: 100,
                frameHeight: 100,
            },
        );

        this.load.spritesheet(
            SpriteKeys.SOLDIER_ATTACK,
            "characters/Characters/Soldier/SoldierWithShadow/Soldier-Attack01.png",
            {
                frameWidth: 100,
                frameHeight: 100,
            },
        );

        this.load.spritesheet(
            SpriteKeys.ORC_ATTACK,
            "characters/Characters/Orc/OrcWithShadow/Orc-Attack01.png",
            {
                frameWidth: 100,
                frameHeight: 100,
            },
        );

        //Walking
        this.load.spritesheet(
            SpriteKeys.SOLDIER_WALK,
            "characters/Characters/Soldier/Soldier/Soldier-Walk.png",
            {
                frameWidth: 100,
                frameHeight: 100,
            },
        );

        this.load.spritesheet(
            SpriteKeys.ORC_WALK,
            "characters/Characters/Orc/OrcWithShadow/Orc-Walk.png",
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
        // this.background = this.add.image(512, 384, "background");
        this.physics.world.fixedStep = false;
        this.physics.world.setBounds(0, 0, 1024, 768);
        // Camera setup
        // this.cameras.main.setBounds(0, 0, 1024, 768);

        const map = this.make.tilemap({
            key: "map",
            tileWidth: 32,
            tileHeight: 32,
        });
        const tileset = map.addTilesetImage("tiles1", "tiles1")!;
        const tileset2 = map.addTilesetImage("tiles_2", "tiles2")!;
        console.log(tileset);

        if (!tileset) {
            throw new Error("Tileset 'tiles_1' not found!");
        }

        /**
         * Don't touch the order it will mess with rendering
         */
        const floorLayer = map.createLayer("Floor", [tileset, tileset2], 0, 0)!;
        const rugLayer = map.createLayer("Rugs", [tileset, tileset2], 0, 0)!;
        const wallLayer = map.createLayer("Wall", [tileset, tileset2], 0, 0)!;
        const wDecorationLayer = map.createLayer(
            "WallDecoration",
            [tileset, tileset2],
            0,
            0,
        )!;
        const furnitureLayer = map.createLayer(
            "Furniture",
            [tileset, tileset2],
            0,
            0,
        )!;
        const fDecorationLayer = map.createLayer(
            "FurnitureDecoration",
            [tileset, tileset2],
            0,
            0,
        )!;

        this.multiplayer.watchNewPlayers(
            this.createPlayer.bind(this),
            this.destroyPlayer.bind(this),
        );
        this.multiplayer.watchPlayerMovement(this.players);
        this.startAnimation();
        this.initializeCollisions(
            wallLayer,
            floorLayer,
            furnitureLayer,
            fDecorationLayer,
            wDecorationLayer,
            rugLayer,
        );
    }

    public createPlayer(
        id: string,
        name: string | undefined,
        x: number,
        y: number,
        opts: { isLocal: boolean },
    ): void {
        if (this.players.has(id)) {
            return this.players.get(id);
        }

        const p = new Player(this, name, id, x, y, SpriteKeys.SOLDIER, {
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
        const tickRate = time - this.lastTick > this.Hz;

        for (const p of this.players.values()) {
            p.update(time, delta);

            if (p.isLocal && tickRate) {
                this.multiplayer.emitPlayerMovement({
                    x: p.x,
                    y: p.y,
                    isAttacking: p.isAttacking,
                    vx: p.vx,
                    vy: p.vy,
                    id: this.localPlayerId,
                    opts: { isLocal: true },
                });

                this.lastTick = time;
            }
        }
    }

    private startAnimation() {
        this.anims.create({
            key: AttackAnimationKeys.SOLDIER,
            frames: this.anims.generateFrameNumbers(SpriteKeys.SOLDIER_ATTACK, {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: 0,
        });

        this.anims.create({
            key: WalkAnimationKeys.SOLDIER,
            frames: this.anims.generateFrameNumbers(SpriteKeys.SOLDIER_WALK, {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: IdleAnimationKeys.SOLDIER,
            frames: this.anims.generateFrameNumbers(SpriteKeys.SOLDIER, {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: IdleAnimationKeys.ORC,
            frames: this.anims.generateFrameNumbers(SpriteKeys.ORC, {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: WalkAnimationKeys.ORC,
            frames: this.anims.generateFrameNumbers(SpriteKeys.ORC_WALK, {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: AttackAnimationKeys.ORC,
            frames: this.anims.generateFrameNumbers(SpriteKeys.ORC_ATTACK, {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: 0,
        });
    }

    private initializeCollisions(
        wallLayer: Phaser.Tilemaps.TilemapLayer,
        floorLayer: Phaser.Tilemaps.TilemapLayer,
        furnitureLayer: Phaser.Tilemaps.TilemapLayer,
        fDecorationLayer: Phaser.Tilemaps.TilemapLayer,
        wDecorationLayer: Phaser.Tilemaps.TilemapLayer,
        rugLayer: Phaser.Tilemaps.TilemapLayer,
    ): void {
        // TODO: organize initialization code
        this.playersLayer = this.physics.add.group();
        this.physics.add.collider(this.playersLayer, wallLayer);
        wallLayer.setCollisionBetween(0, 9500, true);

        this.playersLayer.runChildUpdate = true;
        console.log(
            floorLayer,
            furnitureLayer,
            fDecorationLayer,
            wDecorationLayer,
            rugLayer,
        );

        // Turned off collisions between players for now
        // It makes it harder to move around
        // this.physics.add.collider(this.playersLayer, this.playersLayer);
    }
}
