import { Boot } from "./scenes/Boot";
import { MainMenu } from "./scenes/MainMenu";
import { Game as GameScene } from "./scenes/Game";
import { AUTO, Game } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1224,
    height: 768,
    parent: "game-container",
    backgroundColor: "#000000",
    // scene: [MainMenu],
    scene: [GameScene],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 },
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
