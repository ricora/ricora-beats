import GUI from "lil-gui"
import { DebugGUI } from "../class/DebugGUI"

export class SelectScene extends Phaser.Scene {
    private gui: GUI
    private debugGUI: DebugGUI
    constructor() {
        super("select")

        this.gui = new GUI({ title: "Settings" })
        this.gui.domElement.style.setProperty("left", "15px")
        const params = { noteSpeed: 0 }
        const playFolder = this.gui.addFolder("Play Option")
        playFolder.add(params, "noteSpeed", 1, 10).name("Note Speed")
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
            //this.scene.start("play")
        })
    }
}
