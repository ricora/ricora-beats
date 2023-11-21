export class EachLine {
  public beat: number
  public rectangle: Phaser.GameObjects.Image

  constructor(beat: number, rectangle: Phaser.GameObjects.Image) {
    this.beat = beat
    this.rectangle = rectangle
  }
}
