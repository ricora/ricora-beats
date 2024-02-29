import { type Music } from "./Music"

export class MusicTile extends Phaser.GameObjects.Container {
  private readonly frame: Phaser.GameObjects.Image
  private readonly titleText: Phaser.GameObjects.Text
  private readonly titleIcon: Phaser.GameObjects.Image
  private readonly artistText: Phaser.GameObjects.Text
  private readonly artistIcon: Phaser.GameObjects.Image
  private readonly noterText: Phaser.GameObjects.Text
  private readonly noterIcon: Phaser.GameObjects.Image
  private readonly jacketImage: Phaser.GameObjects.Image

  constructor(public scene: Phaser.Scene) {
    // Phaser.GameObjects.Container
    super(scene, 0, 0)

    this.frame = new Phaser.GameObjects.Image(this.scene, 0, 0, "music-tile-frame").setOrigin(0)
    this.add(this.frame)

    const titleTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Noto Sans JP",
      fontSize: "24px",
      wordWrap: {
        width: this.frame.width - 30 - 50 * 2,
        useAdvancedWrap: true,
      },
    }
    const detailTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Noto Sans JP",
      fontSize: "16px",
      color: "#bbbbbb",
      wordWrap: { width: 180, useAdvancedWrap: true },
    }

    this.titleText = new Phaser.GameObjects.Text(this.scene, 60 + 50 + 40, 11, "", titleTextStyle)
    this.titleText.lineSpacing = 720
    this.add(this.titleText)

    this.artistText = new Phaser.GameObjects.Text(
      this.scene,
      110 + 30,
      this.frame.height - 12 - 21,
      "",
      detailTextStyle,
    )
    this.artistText.lineSpacing = 720
    this.add(this.artistText)

    this.noterText = new Phaser.GameObjects.Text(this.scene, 330 + 30, this.frame.height - 12 - 21, "", detailTextStyle)
    this.noterText.lineSpacing = 720
    this.add(this.noterText)

    this.titleIcon = scene.add.image(123, 27, "icon-music").setScale(0.5).setOrigin(0.5)
    this.add(this.titleIcon)

    this.artistIcon = scene.add
      .image(110, this.frame.height - 12, "icon-artist")
      .setScale(0.7)
      .setOrigin(0, 1)

    this.add(this.artistIcon)

    this.noterIcon = scene.add
      .image(330, this.frame.height - 12, "icon-noter")
      .setScale(0.7)
      .setOrigin(0, 1)

    this.add(this.noterIcon)

    this.jacketImage = scene.add
      .image(54, this.frame.height / 2, "jacket-no-image")
      .setDisplaySize(74, 74)
      .setOrigin(0.5)
    this.add(this.jacketImage)
  }

  public setTitle(title: string): void {
    this.titleText.setText(title)
  }

  public setArtist(artist: string): void {
    this.artistText.setText(artist)
  }

  public setNoter(noter: string): void {
    this.noterText.setText(noter)
  }

  public setMusic(music: Music): void {
    this.titleText.setText(music.title)
    this.artistText.setText(music.artist)
    this.noterText.setText(music.noter)
    const jacketTextureKey = music.jacket !== undefined ? `jacket-${music.folder}/${music.jacket}` : "jacket-no-image"
    this.jacketImage.setTexture(jacketTextureKey).setDisplaySize(74, 74)
  }
}
