import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game, Scale } from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig

// object-fit: contain — 16:9 base resolution scaled to fill the canvas.
// Scale.FIT scales the whole scene up/down; EXPAND only shows more world.
const vw = window.innerWidth;
const vh = window.innerHeight;
const gameWidth = vw / vh >= 16 / 9 ? Math.round(vh * (16 / 9)) : vw;
const gameHeight = Math.round(gameWidth * (9 / 16));

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#028af8",
    scale: {
        mode: Scale.WIDTH_CONTROLS_HEIGHT,
        autoCenter: Scale.CENTER_BOTH,
    },
    scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
