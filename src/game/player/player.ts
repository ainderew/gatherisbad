import Phaser, { Scene } from "phaser";
import {
    AttackAnimationKeys,
    IdleAnimationKeys,
    SpriteKeys,
    WalkAnimationKeys,
} from "../commmon/enums";

export class Player extends Phaser.Physics.Arcade.Sprite {
    id: string;
    name: string;
    sprite: string;
    scene: Scene;
    x: number;
    y: number;

    targetPos = { x: this.x, y: this.y, t: Date.now() }; // latest server target
    prevPos = { x: this.x, y: this.y, t: Date.now() };

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
        name: string | undefined,
        id: string,
        x: number,
        y: number,
        sprite: string,
        ops: { isLocal: boolean },
    ) {
        super(scene, x, y, sprite);

        this.name = name as string;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(false);
        this.setMaxVelocity(400, 400);
        this.setBounce(0.1);
        this.setScale(3);
        this.setPushable(false);
        this.sprite = sprite;

        //Collision box scaling it's too big by default idk why
        const w = Math.round(this.width * 0.2);
        const h = Math.round(this.height * 0.2);
        this.body!.setSize(w, h, true);

        this.id = id;
        this.scene = scene;

        this.moveSpeed = 400;
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
            .text(x, y - 40, this.name, {
                font: "16px Arial",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5, 0.5); // center the text

        this.nameText.setDepth(10);
        this.walkAnimation();

        this.setupUiEventListener();
    }

    public idleAnimation() {
        this.anims.play(IdleAnimationKeys[this.sprite], true);
    }

    private walkAnimation() {
        this.anims.play(WalkAnimationKeys[this.sprite]);
    }

    private attackAnimation() {
        this.anims.play(AttackAnimationKeys[this.sprite], true);
    }

    private changeSprite() {
        this.sprite = SpriteKeys.ORC;
        this.setTexture(SpriteKeys.ORC);
        this.idleAnimation();
    }

    private setupUiEventListener() {
        window.addEventListener("change-sprite", this.changeSprite.bind(this));
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
        const space = this.cursors!.space.isDown;

        let vx = 0;
        let vy = 0;
        if (left) vx -= this.moveSpeed;
        if (right) vx += this.moveSpeed;
        if (up) vy -= this.moveSpeed;
        if (down) vy += this.moveSpeed;

        const isAttacking =
            this.anims.currentAnim?.key === AttackAnimationKeys[this.sprite];

        if (isAttacking && this.anims.isPlaying) {
            // Don't interrupt attack animation
            // Optionally prevent movement during attack:
            return;
        }

        if (left) {
            this.setFlipX(true);
        } else if (right) {
            this.setFlipX(false);
        }

        if (left || right || up || down) {
            if (
                this.anims.currentAnim!.key !== WalkAnimationKeys[this.sprite]
            ) {
                this.walkAnimation();
            }
        } else if (space) {
            if (
                this.anims.currentAnim!.key !== AttackAnimationKeys[this.sprite]
            ) {
                this.attackAnimation();
            }
        } else {
            if (
                this.anims.currentAnim!.key !== IdleAnimationKeys[this.sprite]
            ) {
                console.log("idle");
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
