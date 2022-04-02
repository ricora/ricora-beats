export class SelectScene extends Phaser.Scene {
    constructor() {
        super("select")
    }

    create() {
        const { width, height } = this.game.canvas

        this.add.text(0, 0, "select scene")

        const zone = this.add.zone(width / 2, height / 2, width, height)
        zone.setInteractive({
            useHandCursor: true
        })
        zone.on("pointerdown", () => {
            this.scene.start("play")
        })
    }
}