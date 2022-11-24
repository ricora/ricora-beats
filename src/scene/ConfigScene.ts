import { PlayConfig, NoteType } from "../class/PlayConfig"
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
            .rectangle(width / 2, height / 2, width, height, 0x000000, 128)
            .setDepth(-10)

        this.add
            .zone(width / 2, height / 2, width, height)
            .setInteractive({
                useHandCursor: false,
            })
            .on("pointerdown", () => { })

        this.add
            .image(width / 2, height / 2, "frame-detail")
            .setOrigin(0.5, 0.5)
            .setDepth(-9)

        this.add
            .image(width / 2 - 260, height / 2 - 225, "icon-config")
            .setOrigin(0, 1)
            .setDepth(1)
            .setScale(0.8)

        this.add
            .text(width / 2 - 260 + 60, height / 2 - 230, "プレイ設定", {
                fontFamily: "Noto Sans JP",
                fontSize: "55px",
                color: "#ffffff",
            })
            .setOrigin(0, 1)
            .setScale(0.5)
            .setDepth(1)

        this.add
            .rectangle(width / 2, height / 2 - 220, 530, 3, 0xeeeeee)
            .setDepth(2)

        this.add.rectangle(1100, height / 2, 150, 720, 0x0a0a0a, 30).setDepth(2)

        this.previewNote = this.add.image(1100, height / 2, "").setDepth(3)

        this.add
            .text(width / 2 - 260, height / 2 - 180 + 360 * 0, "ノーツの速さ", {
                fontFamily: "Noto Sans JP",
                fontSize: "35px",
                color: "#f0f0f0",
            })
            .setOrigin(0, 0.5)
            .setScale(0.5)
            .setDepth(1)

        const noteSpeedToggleButton = new ToggleButton(
            this,
            `${this.playConfig.noteSpeed}`
        )
            .setPosition(width / 2 + 260 - 95.5, height / 2 - 180 + 360 * 0)
            .setDepth(2)
        noteSpeedToggleButton.leftZone.on("pointerdown", () => {
            this.sound.play("cursor")
            this.playConfig.noteSpeed = Math.max(
                (Math.round(this.playConfig.noteSpeed * 10) - 1) / 10,
                1
            )
            noteSpeedToggleButton.setText(`${this.playConfig.noteSpeed}`)
            this.previewTimer = new Date()
        })
        noteSpeedToggleButton.rightZone.on("pointerdown", () => {
            this.sound.play("cursor")
            this.playConfig.noteSpeed = Math.min(
                (Math.round(this.playConfig.noteSpeed * 10) + 1) / 10,
                10
            )
            noteSpeedToggleButton.setText(`${this.playConfig.noteSpeed}`)
            this.previewTimer = new Date()
        })
        this.add.existing(noteSpeedToggleButton)

        this.add
            .text(width / 2 - 260, height / 2 - 180 + 360 * 0.2, "ノーツの見た目", {
                fontFamily: "Noto Sans JP",
                fontSize: "35px",
                color: "#f0f0f0",
            })
            .setOrigin(0, 0.5)
            .setScale(0.5)
            .setDepth(1)

        const noteTypeList: NoteType[] = ["circle", "rectangle"]
        this.noteTypeIndex = noteTypeList.indexOf(this.playConfig.noteType)
        const noteTypeToggleButton = new ToggleButton(
            this,
            `${this.playConfig.noteType}`
        )
            .setPosition(width / 2 + 260 - 95.5, height / 2 - 180 + 360 * 0.2)
            .setDepth(2)
        noteTypeToggleButton.leftZone.on("pointerdown", () => {
            this.sound.play("cursor")
            this.noteTypeIndex =
                (this.noteTypeIndex - 1 + noteTypeList.length) % noteTypeList.length
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

        this.add
            .text(width / 2, height / 2 - 180 + 360 * 1.15, "閉じる", {
                fontFamily: "Noto Sans JP",
                fontSize: "35px",
                color: "#f0f0f0",
            })
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
            .setDepth(2)

        this.add
            .image(width / 2, height / 2 - 180 + 360 * 1.15, "frame-button")
            .setOrigin(0.5, 0.5)
            .setDepth(1)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.sound.play("cancel")
                localStorage.setItem("play_config", JSON.stringify(this.playConfig))
                this.scene.stop()
                this.scene.resume("select", { playConfig: this.playConfig })
            })
    }

    update(time: number, dt: number) {
        if (this.playConfig.noteType === "circle") {
            this.previewNote.setTexture("note-circle-1").setDisplaySize(100, 100)
        } else if (this.playConfig.noteType === "rectangle") {
            this.previewNote.setTexture("note-rectangle-2").setDisplaySize(120, 40)
        }
        const previewTime = new Date().getTime() - this.previewTimer.getTime()
        this.previewNote.setY(
            360 -
            320 +
            640 *
            ((previewTime % (-115 * this.playConfig.noteSpeed + 1375)) /
                (-115 * this.playConfig.noteSpeed + 1375))
        )
    }
}
