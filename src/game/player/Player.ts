import Phaser, { Scene } from "phaser";
import { Multiplayer } from "../multiplayer/Multiplayer";

// let sendAccumulator = 0;
// const SEND_INTERVAL = 1000 / 15; // ~15Hz

export default class Player extends Phaser.Physics.Arcade.Sprite {
    id: string;
    scene: Scene;
    speed: number = 100;
    x: number;
    y: number;

    targetPos = { x: this.x, y: this.y, t: Date.now() }; // latest server target
    prevPos = { x: this.x, y: this.y, t: Date.now() };
    interpDelay = 100; // ms

    nameText: Phaser.GameObjects.Text;

    moveSpeed: number;
    isLocal: boolean = true;
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    Multiplayer;

    wasd?: {
        up: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    constructor(
        scene: Scene,
        id: string,
        x: number,
        y: number,
        sprite: string,
        ops: { isLocal: boolean },
    ) {
        super(scene, x, y, sprite);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDrag(600, 600);
        this.setMaxVelocity(300, 300);
        this.setBounce(0.1);
        this.setScale(3);

        this.id = id;
        this.scene = scene;
        this.Multiplayer = new Multiplayer();

        this.moveSpeed = 300;
        this.isLocal = ops.isLocal;

        if (this.isLocal) {
            this.cursors = scene.input.keyboard!.createCursorKeys();
            this.wasd = {
                up: scene.input.keyboard!.addKey("W"),
                left: scene.input.keyboard!.addKey("A"),
                down: scene.input.keyboard!.addKey("S"),
                right: scene.input.keyboard!.addKey("D"),
            };
        }

        this.nameText = scene.add
            .text(x, y - 30, "Andrew", {
                font: "16px Arial",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5, 0.5); // center the text

        this.nameText.setDepth(10);

        this.startAnimation();
        this.idle();
    }

    public startAnimation() {
        this.scene.anims.create({
            key: "idle",
            frames: this.scene.anims.generateFrameNumbers("char", {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });
    }

    public idle() {
        this.anims.play("idle");
    }

    public update() {
        if (this.isLocal) {
            this.updateInput();
        } else {
            this.interpolateRemote();
        }
        this.nameText.setPosition(this.x, this.y - 30);
    }

    private updateInput() {
        const left = this.cursors!.left.isDown || this.wasd!.left.isDown;
        const right = this.cursors!.right.isDown || this.wasd!.right.isDown;
        const up = this.cursors!.up.isDown || this.wasd!.up.isDown;
        const down = this.cursors!.down.isDown || this.wasd!.down.isDown;

        let vx = 0;
        let vy = 0;
        if (left) vx -= this.moveSpeed;
        if (right) vx += this.moveSpeed;
        if (up) vy -= this.moveSpeed;
        if (down) vy += this.moveSpeed;

        // normalize diagonal movement so speed is consistent
        if (vx !== 0 && vy !== 0) {
            vx *= Math.SQRT1_2;
            vy *= Math.SQRT1_2;
        }

        this.setVelocity(vx, vy);

        this.Multiplayer.emitPlayerMovement({
            x: this.x,
            y: this.y,
            vx,
            vy,
            id: this.Multiplayer.socket.id,
            opts: { isLocal: true },
        });

        // Optionally, notify the server of new state here (throttled).
        // e.g. this.scene.networkSend('move', { id: this.id, x: this.x, y: this.y, vx, vy })
    }

    private interpolateRemote() {
        if (!this.targetPos) return; // no update yet

        const lerpFactor = 1;
        this.x += (this.targetPos.x - this.x) * lerpFactor;
        this.y += (this.targetPos.y - this.y) * lerpFactor;
    }
}
