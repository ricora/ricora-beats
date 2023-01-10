export class JudgeMeter {
    public rectangle: Phaser.GameObjects.Rectangle
    public judgedTime: number

    constructor(scene: Phaser.Scene, deltaTime: number) {
        this.judgedTime = new Date().getTime()

        let color = 0xffffff
        if (18 <= deltaTime * 1000) {
            color = 0x2fdfe2
        } else if (deltaTime * 1000 <= -18) {
            color = 0xe530e5
        }
        this.rectangle = scene.add
            .rectangle(640 - deltaTime * 1200, 360, 1, 30, color)
            .setDepth(20)
    }

    public update() {
        this.rectangle.setAlpha(1 - (new Date().getTime() - this.judgedTime) / 5000)
    }
}
