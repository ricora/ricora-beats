export class TitleScene extends Phaser.Scene {
    constructor() {
        super("title")
    }

    create() {
        const { width, height } = this.game.canvas

        this.add.text(0, 0, "title scene")

        const zone = this.add.zone(width / 2, height / 2, width, height)
        zone.setInteractive({
            useHandCursor: true
        })
        zone.on("pointerdown", () => {
            this.scene.start("select")
        })
    }
}