import { PlayConfig, NoteType } from "../class/PlayConfig"
import { ToggleButton } from "../class/ToggleButton"

export class ConfigScene extends Phaser.Scene {
    private playConfig: PlayConfig

    private noteTypeIndex: number

    constructor() {
        super("config")
    }

    init(data: any) {
        this.playConfig = data.playConfig
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
            this.playConfig.noteSpeed = Math.max(
                (Math.round(this.playConfig.noteSpeed * 10) - 1) / 10,
                1
            )
            noteSpeedToggleButton.setText(`${this.playConfig.noteSpeed}`)
        })
        noteSpeedToggleButton.rightZone.on("pointerdown", () => {
            this.playConfig.noteSpeed = Math.min(
                (Math.round(this.playConfig.noteSpeed * 10) + 1) / 10,
                10
            )
            noteSpeedToggleButton.setText(`${this.playConfig.noteSpeed}`)
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
            this.noteTypeIndex =
                (this.noteTypeIndex - 1 + noteTypeList.length) % noteTypeList.length
            this.playConfig.noteType = noteTypeList[this.noteTypeIndex]
            noteTypeToggleButton.setText(`${this.playConfig.noteType}`)
        })
        noteTypeToggleButton.rightZone.on("pointerdown", () => {
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
                this.scene.stop()
                this.scene.resume("select", { playConfig: this.playConfig })
            })
    }
}
