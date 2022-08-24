import * as Phaser from "phaser"
import { Scenes } from './scene'




const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "game-app",
        width: 1280,
        height: 720
    },
    parent: "game-app",
    scene: Scenes
}

new Phaser.Game(config)