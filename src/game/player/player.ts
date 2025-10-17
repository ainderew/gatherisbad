import Phaser, { Scene } from "phaser";
import {
    AttackAnimationKeys,
    IdleAnimationKeys,
    SpriteKeys,
    WalkAnimationKeys,
} from "../commmon/enums";
import { ReactionData } from "@/communication/reaction/_types";

export class Player extends Phaser.Physics.Arcade.Sprite {
    id: string;
    name: string;
    sprite: string;
    scene: Scene;
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetPos = {
        x: this.x,
        y: this.y,
        vx: 0,
        vy: 0,
        t: Date.now(),
    }; // latest server target
    prevPos = { x: this.x, y: this.y, t: Date.now() };

    isAttacking: boolean;
    isRaisingHand: boolean = false;
    raisHandGraphics: {
        bubble: Phaser.GameObjects.Graphics;
        emojiText: Phaser.GameObjects.Text;
    } | null = null;

    playerProducerIds: string[];

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
        this.setMaxVelocity(500, 500);
        this.setBounce(0.1);
        this.setScale(2);
        this.setPushable(false);
        this.sprite = sprite;

        const w = Math.round(this.width * 1);
        const h = Math.round(this.height * 0.5);
        this.body!.setSize(w, h, true);
        this.body?.setOffset(0, this.height - h);

        console.log(`SETTING ID FOR ${name}`, id);
        this.id = id;
        this.scene = scene;

        this.moveSpeed = 600;
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

    public showReactionTag(data: ReactionData) {
        if (!data.reaction) {
            console.warn("No emoji provided");
            return;
        }

        if (data.playerId && data.playerId !== this.id) {
            console.log("Emoji not for this player");
            return;
        }

        if (data.reaction === "stop-raise-hand") {
            this.destroyReactionTagInstantly(
                this.raisHandGraphics!.bubble,
                this.raisHandGraphics!.emojiText,
            );
            return;
        }

        // Create emoji text first to measure its size
        const emojiText = this.scene.add
            .text(0, -70, data.reaction, {
                font: "25px Arial",
                color: "#000000",
            })
            .setOrigin(0.5, 0.5);

        // Get text dimensions for bubble sizing
        const textBounds = emojiText.getBounds();
        const padding = 12;
        const bubbleWidth = textBounds.width + padding * 2;
        const bubbleHeight = textBounds.height + padding * 2;
        const tailHeight = 10;

        // Create speech bubble background
        const bubble = this.scene.add.graphics();

        this.createBubble(
            bubble,
            bubbleWidth,
            bubbleHeight,
            tailHeight,
            emojiText.x,
            emojiText.y,
        );

        this.uiContainer.add([bubble, emojiText]);

        bubble.setScale(0);
        emojiText.setScale(0);

        this.scene.tweens.add({
            targets: [bubble, emojiText],
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: "Back.easeOut",
        });

        this.uiContainer.add([bubble, emojiText]);

        if (data.reaction === "🤚") {
            this.isRaisingHand = true;
            this.raisHandGraphics = { bubble, emojiText };
        } else {
            this.destroyReactionTag(bubble, emojiText);
        }
    }

    private destroyReactionTag(
        bubble: Phaser.GameObjects.Graphics,
        emojiText: Phaser.GameObjects.Text,
    ) {
        this.scene.time.delayedCall(3000, () => {
            this.scene?.tweens?.add({
                targets: [bubble, emojiText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    bubble.destroy();
                    emojiText.destroy();
                },
            });
        });
    }

    destroyReactionTagInstantly(
        bubble: Phaser.GameObjects.Graphics,
        emojiText: Phaser.GameObjects.Text,
    ) {
        this.scene?.tweens?.add({
            targets: [bubble, emojiText],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                bubble.destroy();
                emojiText.destroy();
            },
        });
    }

    private createBubble(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        tailHeight: number,
        x: number,
        y: number,
    ) {
        graphics.clear();

        // Bubble colors
        graphics.fillStyle(0xffffff, 0.95); // White with slight transparency
        // graphics.lineStyle(2, 0x333333, 1); // Dark border

        const cornerRadius = 8;
        const bubbleX = x - width / 2;
        const bubbleY = y - height / 2;

        // Draw rounded rectangle
        graphics.fillRoundedRect(bubbleX, bubbleY, width, height, cornerRadius);
        graphics.strokeRoundedRect(
            bubbleX,
            bubbleY,
            width,
            height,
            cornerRadius,
        );

        // Draw speech bubble tail pointing down
        const tailX = x;
        const tailY = bubbleY + height;

        graphics.fillTriangle(
            tailX - 8,
            tailY, // Left point
            tailX + 8,
            tailY, // Right point
            tailX,
            tailY + tailHeight, // Bottom point
        );
        graphics.strokeTriangle(
            tailX - 8,
            tailY,
            tailX + 8,
            tailY,
            tailX,
            tailY + tailHeight,
        );
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

        this.uiContainer = this.scene.add.container(this.x, this.y - 50, [
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
        this.anims.play(WalkAnimationKeys[this.sprite], true);
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
        this.uiContainer.setPosition(this.x, this.y - 40);
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
            if (up) {
                this.anims.play(WalkAnimationKeys.ADAM_UP, true);
            } else if (down) {
                this.anims.play(WalkAnimationKeys.ADAM_DOWN, true);
            } else {
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
