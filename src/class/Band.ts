import bms from "bms"

export class Band {
  public startBeat: number
  public endBeat: number
  public image: Phaser.GameObjects.Image

  constructor(startBeat: number, endBeat: number, image: Phaser.GameObjects.Image) {
    this.startBeat = startBeat
    this.endBeat = endBeat
    this.image = image
  }
}
