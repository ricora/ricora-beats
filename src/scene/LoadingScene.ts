import WebFont from "webfontloader"

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super("loading")
    }

    preload() {
        this.load.image("frame-back", "./assets/skin/frame_back.png")
        this.load.image("frame-light", "./assets/skin/frame_light.png")

        this.load.image("judge-0", "./assets/skin/judge_0.png")
        this.load.image("judge-1", "./assets/skin/judge_1.png")
        this.load.image("judge-2", "./assets/skin/judge_2.png")
        this.load.image("judge-3", "./assets/skin/judge_3.png")
        this.load.image("judge-4", "./assets/skin/judge_4.png")

        this.load.image("judge-fast", "./assets/skin/judge_fast.png")
        this.load.image("judge-slow", "./assets/skin/judge_slow.png")

        this.load.glsl("background", "./assets/shader/synthwave.frag")
        WebFont.load({
            google: {
                families: [
                    "Zen Kaku Gothic New:700",
                    "Noto Sans Japanese:900,bold",
                    "Bungee",
                ],
            },
        })
    }

    create() {
        const { width, height } = this.game.canvas

        this.add.image(width / 2, height / 2, "logo")

        this.add.text(width / 2, height / 2 + 60, "Loading...").setOrigin(0.5)

        this.load.on("complete", () => {
            this.scene.start("title")
        })

        this.load.start()
    }
}
