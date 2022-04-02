import * as Phaser from "phaser"
import { Scenes } from './scene'

class MyScene extends Phaser.Scene {
    constructor() {
        super("myscene")
    }

    preload() {

    }

    create() {
        this.add.text(640, 360, "Hello World", { fontFamily: "arial", fontSize: "60px" }).setOrigin(0.5)
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: "game-app",
    scene: Scenes
}

new Phaser.Game(config)