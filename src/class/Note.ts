export class Note {
  public beat: number
  public sec: number
  public value: number
  public image: Phaser.GameObjects.Image
  public lightImage: Phaser.GameObjects.Image | null
  public isBGM: boolean
  public isJudged: boolean
  public isLongStart: boolean
  public isLongEnd: boolean

  constructor(
    beat: number,
    sec: number,
    value: number,
    image: Phaser.GameObjects.Image,
    lightImage: Phaser.GameObjects.Image | null,
    isBGM: boolean,
    isJudged: boolean,
    isLongStart: boolean,
    isLongEnd: boolean,
  ) {
    this.beat = beat
    this.sec = sec
    this.value = value
    this.image = image
    this.lightImage = lightImage
    this.isBGM = isBGM
    this.isJudged = isJudged
    this.isLongStart = isLongStart
    this.isLongEnd = isLongEnd
  }
}
