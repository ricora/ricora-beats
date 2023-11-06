import * as Phaser from "phaser"
import { Scenes } from "./scene"

import KawaseBlurPipelinePlugin from "phaser3-rex-plugins/plugins/kawaseblurpipeline-plugin"

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game-app",
    width: 1280,
    height: 720,
  },
  dom: {
    createContainer: true,
  },
  parent: "game-app",
  plugins: {
    global: [
      {
        key: "rexKawaseBlurPipeline",
        plugin: KawaseBlurPipelinePlugin,
        start: true,
      },
    ],
  },
  scene: Scenes,
}

new Phaser.Game(config)
