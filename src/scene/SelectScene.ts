import GUI from "lil-gui"
import { DebugGUI } from "../class/DebugGUI"
import { PlayConfig } from "../class/PlayConfig"

export class SelectScene extends Phaser.Scene {
    private gui: GUI
    private debugGUI: DebugGUI
    private debugParams: any
    constructor() {
        super("select")

        this.gui = new GUI({ title: "Settings" })
        this.gui.domElement.style.setProperty("left", "15px")
        this.debugParams = { noteSpeed: 6.5, noteType: "rectangle" }
        const playFolder = this.gui.addFolder("Play Option")
        playFolder.add(this.debugParams, "noteSpeed", 1, 10).name("Note Speed")
        playFolder.add(this.debugParams, "noteType", ["rectangle", "circle"]).name("Note Type")
        this.gui.hide()
    }

    init() {
        this.gui.show()
        this.debugGUI = new DebugGUI(this)
        this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, () => {
            this.debugGUI.destroy()
            this.gui.hide()
        })
    }
    create() {
        const { width, height } = this.game.canvas

        this.add.text(0, 0, "select scene")

        const zone = this.add.zone(width / 2, height / 2, width, height)
        zone.setInteractive({
            useHandCursor: true,
        })
        zone.on("pointerdown", () => {
            this.scene.start("play", {
                playConfig: new PlayConfig({
                    noteSpeed: this.debugParams.noteSpeed,
                    noteType: this.debugParams.noteType,
                    title: "title",
                    artist: "artist",
                    difficulty:2
                }),
            })
        })
    }
}
