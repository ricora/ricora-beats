export class PlayScene extends Phaser.Scene {
    constructor() {
        super("play")
    }

    create() {
        const { width, height } = this.game.canvas

        this.add.text(0, 0, "play scene")

        const zone = this.add.zone(width / 2, height / 2, width, height)
        zone.setInteractive({
            useHandCursor: true
        })
        zone.on("pointerdown", () => {
            this.scene.start("title")
        })
    }
}