import bms from "bms"

export class Note {
    public beat: number
    public sec: number
    public value: number
    public rectangle: Phaser.GameObjects.Rectangle
    public isBGM: boolean
    public isJudged: boolean
    public isLongStart: boolean
    public isLongEnd: boolean

    constructor(beat: number, sec: number, value: number, rectangle: Phaser.GameObjects.Rectangle, isBGM: boolean, isJudged: boolean, isLongStart: boolean, isLongEnd: boolean) {
        this.beat = beat
        this.sec = sec
        this.value = value
        this.rectangle = rectangle
        this.isBGM = isBGM
        this.isJudged = isJudged
        this.isLongStart = isLongStart
        this.isLongEnd = isLongEnd

        this.rectangle.depth = 1
    }


}