
export class Measure {
    public beat: number
    public rectangle: Phaser.GameObjects.Rectangle

    constructor(beat: number, rectangle: Phaser.GameObjects.Rectangle) {
        this.beat = beat
        this.rectangle = rectangle
    }
}