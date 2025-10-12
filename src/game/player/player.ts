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
    vx: number;
    vy: number;
    isAttacking: boolean;

    playerProducerIds: string[];

    targetPos = {
        x: this.x,
        y: this.y,
        vx: 0,
        vy: 0,
        t: Date.now(),
    }; // latest server target
    prevPos = { x: this.x, y: this.y, t: Date.now() };

    nameText: Phaser.GameObjects.Text;
    voiceIndicator: Phaser.GameObjects.Image;
    uiContainer: Phaser.GameObjects.Container;

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

        this.initializeNameTag();
        this.idleAnimation();
        this.setupUiEventListener();
    }

    public initializeNameTag() {
        this.nameText = this.scene.add
            .text(0, 0, this.name, {
                font: "16px Arial",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5, 0.5);

        const nameWidth = this.nameText.width;
        const nameHeight = this.nameText.height;

        const padding = 8;

        const bgWidth = nameWidth + padding * 2;
        const bgHeight = nameHeight + padding * 2;

        const background = this.scene.add.graphics();
        background.fillStyle(0x000000, 0.5); // Black with 50% opacity
        background.fillRoundedRect(
            -bgWidth / 2,
            -bgHeight / 2,
            bgWidth,
            bgHeight,
            8, // Corner radius
        );

        this.uiContainer = this.scene.add.container(this.x, this.y - 60, [
            background,
            this.nameText,
        ]);

        this.uiContainer.setDepth(10);
    }

    public showVoiceIndicator() {
        this.voiceIndicator.setVisible(true);
    }

    public hideVoiceIndicator() {
        this.voiceIndicator.setVisible(false);
    }

    public idleAnimation() {
        this.anims.play(IdleAnimationKeys[this.sprite], true);
    }

    private walkAnimation() {
        this.anims.play(WalkAnimationKeys[this.sprite]);
    }

    private attackAnimation() {
        console.log("Trying to attackAnimation");
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
        this.uiContainer.setPosition(this.x, this.y - 60);
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

        const isAnimateAttacking =
            this.anims.currentAnim?.key === AttackAnimationKeys[this.sprite];

        if (isAnimateAttacking && this.anims.isPlaying) {
            // Don't interrupt attack animation
            // Optionally prevent movement during attack:
            return;
        }

        if (this.isAttacking) {
            this.isAttacking = false;
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
                this.isAttacking = true;
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
        this.vx = vx;
        this.vy = vy;
    }

    private interpolateRemote() {
        const isAnimateAttacking =
            this.anims.currentAnim?.key === AttackAnimationKeys[this.sprite];

        if (isAnimateAttacking && this.anims.isPlaying) {
            return;
        }

        if (!this.targetPos) return;

        const now = Date.now();
        const elapsed = (now - this.targetPos.t) / 1000; // seconds

        const predictedX =
            this.targetPos.x + (this.targetPos.vx || 0) * elapsed;
        const predictedY =
            this.targetPos.y + (this.targetPos.vy || 0) * elapsed;

        const lerpFactor = 0.2;
        this.x += (predictedX - this.x) * lerpFactor;
        this.y += (predictedY - this.y) * lerpFactor;

        if (this.targetPos.vx < -1) {
            this.setFlipX(true);
        } else if (this.targetPos.vx > 1) {
            this.setFlipX(false);
        }

        const isMoving =
            Math.abs(this.targetPos.vx || 0) > 10 ||
            Math.abs(this.targetPos.vy || 0) > 10;

        if (this.isAttacking) {
            if (
                this.anims.currentAnim?.key !== AttackAnimationKeys[this.sprite]
            ) {
                this.attackAnimation();
            }
        } else if (isMoving) {
            if (
                this.anims.currentAnim?.key !== WalkAnimationKeys[this.sprite]
            ) {
                this.walkAnimation();
            }
        } else {
            if (
                this.anims.currentAnim?.key !== IdleAnimationKeys[this.sprite]
            ) {
                this.idleAnimation();
            }
        }
    }

    public destroy() {
        this.uiContainer.destroy();
        super.destroy();
    }
}
