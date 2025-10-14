import { Game as GameScene } from "./scenes/Game";
import { AUTO, Game } from "phaser";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    backgroundColor: "#737373",
    title: "Gather Is Bad",
    disableContextMenu: true,

    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "game-container",
        width: "100%",
        height: "100%",
    },
    scene: [GameScene],
    pixelArt: true,
    roundPixels: true,

    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            debugShowBody: true,
            gravity: { x: 0, y: 0 },
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
