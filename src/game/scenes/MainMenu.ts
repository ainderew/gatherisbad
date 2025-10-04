import { GameObjects, Scene, Types } from "phaser";
import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    player: Phaser.GameObjects.Sprite; // <-- declare player here
    cursors!: Types.Input.Keyboard.CursorKeys;
    speed: number = 100;

    constructor() {
        super("MainMenu");
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

        this.load.once("complete", () => console.log("All assets loaded"));
    }

    create() {
        this.title = this.add
            .text(512, 460, "Theoria Tech Team", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        this.add.rectangle(1224 / 2, 768 / 2, 100, 100, 0xff0000);
        this.player = this.add.sprite(100, 100, "char", 0).setScale(3);
        this.player.setDepth(200);
        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("char-walk", {
                start: 0,
                end: 8,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("char", {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.player.anims.play("idle");
        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start("Game");
    }

    update(time: number, delta: number) {
        if (!this.player || !this.cursors) return;

        const speed = this.speed;
        let moving = false;

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.player.x -= speed * (delta / 1000);
            this.player.flipX = true;
            moving = true;
            // this.player.anims.play("walk-left", true); // create left anim if needed
        } else if (this.cursors.right.isDown) {
            this.player.x += speed * (delta / 1000);
            this.player.flipX = false;
            moving = true;
            // this.player.anims.play("walk-right", true);
        }

        // Vertical movement
        if (this.cursors.up.isDown) {
            this.player.y -= speed * (delta / 1000);
            moving = true;
            // this.player.anims.play("walk-up", true);
        } else if (this.cursors.down.isDown) {
            this.player.y += speed * (delta / 1000);
            moving = true;
            // this.player.anims.play("walk-down", true);
        }

        if (this.player.anims.isPlaying) {
            if (!moving && this.player.anims.currentAnim.key !== "idle") {
                this.player.anims.play("idle");
            } else if (moving && this.player.anims.currentAnim.key !== "walk") {
                this.player.anims.play("walk");
            }
        }
    }

    moveLogo(reactCallback: ({ x, y }: { x: number; y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: "Back.easeInOut" },
                y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback) {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y),
                        });
                    }
                },
            });
        }
    }
}
