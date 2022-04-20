import bms from "bms"

export class Band {
    public startBeat: number
    public endBeat: number
    public rectangle: Phaser.GameObjects.Rectangle

    constructor(startBeat: number, endBeat: number, rectangle: Phaser.GameObjects.Rectangle) {
        this.startBeat = startBeat
        this.endBeat = endBeat
        this.rectangle = rectangle

        this.rectangle.depth = -1
    }
}