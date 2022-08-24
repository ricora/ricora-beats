import GUI from "lil-gui"

export class DebugGUI {
    public gui: GUI
    public params: any

    constructor(public scene: Phaser.Scene) {
        this.gui = new GUI({ title: "Debug Menu" })
        this.params = {
            title: () => {
                this.changeScene("title")
            },
            select: () => {
                this.changeScene("select")
            },
            play: () => {
                this.changeScene("play")
            },
        }
        const sceneFolder = this.gui.addFolder("Scenes")
        sceneFolder.add(this.params, "title")
        sceneFolder.add(this.params, "select")
        sceneFolder.add(this.params, "play")
    }

    public changeScene(key: string) {
        this.destroy()
        this.scene.scene.start(key)
    }

    public destroy() {
        this.gui.destroy()
    }
}
