import Phaser, { Scene } from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
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

        this.setCollideWorldBounds(false);
        this.setDrag(600, 600);
        this.setMaxVelocity(300, 300);
        this.setBounce(0.1);
        this.setScale(3);
        this.setPushable(false);

        const w = Math.round(this.width * 0.2);
        const h = Math.round(this.height * 0.2);
        this.body!.setSize(w, h, true);

        this.id = id;
        this.scene = scene;

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
            .text(x, y - 40, "Andrew", {
                font: "16px Arial",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5, 0.5); // center the text

        this.nameText.setDepth(10);

        this.idleAnimation();
    }

    public idleAnimation() {
        this.anims.play("idle");
    }

    private walkAnimation() {
        this.anims.play("walk");
    }

    public update() {
        if (this.isLocal) {
            this.updateInput();
        } else {
            this.interpolateRemote();
        }
        this.nameText.setPosition(this.x, this.y - 40);
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

        if (left || right || up || down) {
            if (
                this.anims.currentAnim!.key === "idle" &&
                this.anims.isPlaying
            ) {
                this.walkAnimation();
            }
        } else {
            if (
                this.anims.currentAnim!.key === "walk" &&
                this.anims.isPlaying
            ) {
                this.idleAnimation();
            }
        }

        // normalize diagonal movement so speed is consistent
        if (vx !== 0 && vy !== 0) {
            vx *= Math.SQRT1_2;
            vy *= Math.SQRT1_2;
        }

        this.setVelocity(vx, vy);
    }

    private interpolateRemote() {
        if (!this.targetPos) return; // no update yet

        if (this.x != this.targetPos.x || this.y != this.targetPos.y) {
            if (
                this.anims.currentAnim!.key === "idle" &&
                this.anims.isPlaying
            ) {
                this.walkAnimation();
            }
        } else {
            if (
                this.anims.currentAnim!.key === "walk" &&
                this.anims.isPlaying
            ) {
                this.idleAnimation();
            }
        }

        const lerpFactor = 0.1;
        this.x += (this.targetPos.x - this.x) * lerpFactor;
        this.y += (this.targetPos.y - this.y) * lerpFactor;
    }
}
