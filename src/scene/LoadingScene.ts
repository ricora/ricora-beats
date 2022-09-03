import WebFont from "webfontloader"

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super("loading")
    }

    preload() {
        this.load.image("frame-back", "./assets/skin/frame_back.png")
        this.load.image("frame-light", "./assets/skin/frame_light.png")

        this.load.image("note-1", "./assets/skin/note1.png")
        this.load.image("note-2", "./assets/skin/note2.png")
        this.load.image("note-3", "./assets/skin/note3.png")

        this.load.image("note-long", "./assets/skin/longnote.png")

        this.load.image("judge-0", "./assets/skin/judge_0.png")
        this.load.image("judge-1", "./assets/skin/judge_1.png")
        this.load.image("judge-2", "./assets/skin/judge_2.png")
        this.load.image("judge-3", "./assets/skin/judge_3.png")
        this.load.image("judge-4", "./assets/skin/judge_4.png")

        this.load.image("judge-fast", "./assets/skin/judge_fast.png")
        this.load.image("judge-slow", "./assets/skin/judge_slow.png")

        this.load.image("bomb-1", "assets/skin/bomb1.png")
        this.load.image("bomb-2", "assets/skin/bomb2.png")
        this.load.image("bomb-3", "assets/skin/bomb3.png")
        this.load.image("particle", "assets/skin/particle.png")

        this.load.image("key-flash", "./assets/skin/keyflash.png")

        //this.load.image("jacket-test", "./assets/jacket_test.png")

        this.load.glsl("background", "./assets/shader/synthwave.frag")
        WebFont.load({
            google: {
                families: ["Noto+Sans+JP:900", "Bungee", "Fredoka+One"],
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
