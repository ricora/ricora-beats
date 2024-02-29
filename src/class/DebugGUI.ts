import GUI from "lil-gui"

export class DebugGUI {
  public gui: GUI
  public params: any

  constructor(public scene: Phaser.Scene) {
    this.gui = new GUI({ title: "Debug Menu" })
    this.gui.hide()
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
      result: () => {
        this.changeScene("result")
      },
    }
    const sceneFolder = this.gui.addFolder("Scenes")
    sceneFolder.add(this.params, "title")
    sceneFolder.add(this.params, "select")
    sceneFolder.add(this.params, "play")
    sceneFolder.add(this.params, "result")
  }

  public changeScene(key: string): void {
    this.destroy()
    this.scene.scene.start(key)
  }

  public destroy(): void {
    this.gui.destroy()
  }
}
