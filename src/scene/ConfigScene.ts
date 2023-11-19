import { type NoteType, type PlayConfig } from "../class/PlayConfig"
import { ToggleButton } from "../class/ToggleButton"

export class ConfigScene extends Phaser.Scene {
  private playConfig: PlayConfig

  private previewNote: Phaser.GameObjects.Image
  private previewTimer: Date

  private noteTypeIndex: number

  constructor() {
    super("config")
  }

  init(data: any) {
    this.playConfig = data.playConfig
    this.previewTimer = new Date()
  }

  create() {
    const { width, height } = this.game.canvas

    this.add
      .zone(width / 2, height / 2, width, height)
      .setInteractive({
        useHandCursor: false,
      })
      .on("pointerdown", () => {})

    const frame = this.add
      .image(width / 2, height / 2, "frame-detail")
      .setOrigin(0.5, 0.5)
      .setDepth(-9)
      .setScale(1, 0)

    const icon = this.add
      .image(width / 2 - 260, height / 2 - 225, "icon-config")
      .setOrigin(0, 1)
      .setDepth(1)
      .setScale(0.8)
      .setAlpha(0)

    const titleLabel = this.add
      .text(width / 2 - 260 + 60, height / 2 - 230, "プレー設定", {
        fontFamily: "Noto Sans JP",
        fontSize: "55px",
        color: "#ffffff",
      })
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const line = this.add
      .rectangle(width / 2, height / 2 - 220, 530, 3, 0xeeeeee)
      .setDepth(2)
      .setScale(0, 1)

    const previewNoteFrame = this.add
      .rectangle(1100, 0, 150, 720, 0x0a0a0a, 30)
      .setDepth(2)
      .setOrigin(0.5, 0)
      .setScale(0, 0)

    this.previewNote = this.add.image(1100, height / 2, "").setDepth(3)

    const noteSpeedLabel = this.add
      .text(width / 2 - 260, height / 2 - 180 + 360 * 0, "ノーツの速さ", {
        fontFamily: "Noto Sans JP",
        fontSize: "35px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const noteSpeedToggleButton = new ToggleButton(this, `${this.playConfig.noteSpeed}`)
      .setPosition(width / 2 + 260 - 95.5, height / 2 - 180 + 360 * 0)
      .setDepth(2)
      .setAlpha(0)
    noteSpeedToggleButton.leftZone.on("pointerdown", () => {
      this.sound.play("cursor")
      this.playConfig.noteSpeed = Math.max((Math.round(this.playConfig.noteSpeed * 10) - 1) / 10, 1)
      noteSpeedToggleButton.setText(`${this.playConfig.noteSpeed}`)
      this.previewTimer = new Date()
    })
    noteSpeedToggleButton.rightZone.on("pointerdown", () => {
      this.sound.play("cursor")
      this.playConfig.noteSpeed = Math.min((Math.round(this.playConfig.noteSpeed * 10) + 1) / 10, 10)
      noteSpeedToggleButton.setText(`${this.playConfig.noteSpeed}`)
      this.previewTimer = new Date()
    })
    this.add.existing(noteSpeedToggleButton)

    const noteTypeLabel = this.add
      .text(width / 2 - 260, height / 2 - 180 + 360 * 0.2, "ノーツの見た目", {
        fontFamily: "Noto Sans JP",
        fontSize: "35px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const noteTypeList: NoteType[] = ["circle", "rectangle", "line"]
    this.noteTypeIndex = noteTypeList.indexOf(this.playConfig.noteType)
    const noteTypeToggleButton = new ToggleButton(this, `${this.playConfig.noteType}`)
      .setPosition(width / 2 + 260 - 95.5, height / 2 - 180 + 360 * 0.2)
      .setDepth(2)
      .setAlpha(0)
    noteTypeToggleButton.leftZone.on("pointerdown", () => {
      this.sound.play("cursor")
      this.noteTypeIndex = (this.noteTypeIndex - 1 + noteTypeList.length) % noteTypeList.length
      this.playConfig.noteType = noteTypeList[this.noteTypeIndex]
      noteTypeToggleButton.setText(`${this.playConfig.noteType}`)
    })
    noteTypeToggleButton.rightZone.on("pointerdown", () => {
      this.sound.play("cursor")
      this.noteTypeIndex = (this.noteTypeIndex + 1) % noteTypeList.length
      this.playConfig.noteType = noteTypeList[this.noteTypeIndex]
      noteTypeToggleButton.setText(`${this.playConfig.noteType}`)
    })
    this.add.existing(noteTypeToggleButton)

    const closeLabel = this.add
      .text(width / 2, height / 2 - 180 + 360 * 1.15, "閉じる", {
        fontFamily: "Noto Sans JP",
        fontSize: "35px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(2)
      .setAlpha(0)

    const closeButton = this.add
      .image(width / 2, height / 2 - 180 + 360 * 1.15, "frame-button")
      .setOrigin(0.5, 0.5)
      .setDepth(1)
      .setAlpha(0)
      .setInteractive({
        useHandCursor: true,
      })
      .once("pointerdown", () => {
        this.sound.play("cancel")
        localStorage.setItem("play_config", JSON.stringify(this.playConfig))

        this.tweens.add({
          targets: [
            icon,
            titleLabel,
            noteSpeedLabel,
            noteSpeedToggleButton,
            noteTypeLabel,
            noteTypeToggleButton,
            closeLabel,
            closeButton,
            this.previewNote,
          ],
          delay: 0,
          alpha: {
            value: 0,
            duration: 150,
          },
        })

        this.tweens.add({
          targets: [line],
          delay: 100,
          scaleX: {
            value: 0,
            duration: 200,
            ease: Phaser.Math.Easing.Cubic.Out,
          },
        })
        this.tweens.add({
          targets: [frame],
          delay: 200,
          scaleY: {
            value: 0,
            duration: 200,
            ease: Phaser.Math.Easing.Cubic.Out,
          },
          alpha: {
            value: 0,
            duration: 200,
          },
          onComplete: () => {
            this.scene.stop()
            this.scene.resume("select", { playConfig: this.playConfig })
          },
        })

        this.tweens.add({
          targets: [previewNoteFrame],
          delay: 100,
          scaleX: {
            value: 0,
            duration: 100,
          },
        })
      })

    this.tweens.add({
      targets: [frame],
      delay: 0,
      scaleY: {
        value: 1,
        duration: 200,
        ease: Phaser.Math.Easing.Cubic.Out,
      },
    })

    this.tweens.add({
      targets: [line],
      delay: 100,
      scaleX: {
        value: 1,
        duration: 200,
        ease: Phaser.Math.Easing.Cubic.Out,
      },
    })

    this.tweens.add({
      targets: [
        icon,
        titleLabel,
        noteSpeedLabel,
        noteSpeedToggleButton,
        noteTypeLabel,
        noteTypeToggleButton,
        closeLabel,
        closeButton,
        this.previewNote,
      ],
      delay: 200,
      alpha: {
        value: 1,
        duration: 150,
      },
    })

    this.tweens.add({
      targets: [previewNoteFrame],
      delay: 0,
      scaleX: {
        value: 1,
        duration: 200,
        ease: Phaser.Math.Easing.Cubic.Out,
      },
      scaleY: {
        value: 1,
        duration: 200,
        ease: Phaser.Math.Easing.Cubic.Out,
      },
    })
  }

  update(time: number, dt: number) {
    if (this.playConfig.noteType === "circle") {
      this.previewNote.setTexture("note-circle-1").setDisplaySize(100, 100)
    } else if (this.playConfig.noteType === "rectangle") {
      this.previewNote.setTexture("note-rectangle-2").setDisplaySize(120, 40)
    } else if (this.playConfig.noteType === "line") {
      this.previewNote.setTexture("note-line-1").setDisplaySize(138, 60)
    }
    const previewTime = new Date().getTime() - this.previewTimer.getTime()
    this.previewNote.setY(
      360 -
        320 +
        640 * ((previewTime % (-115 * this.playConfig.noteSpeed + 1375)) / (-115 * this.playConfig.noteSpeed + 1375)),
    )
  }
}
