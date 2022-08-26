import bms from "bms"
import axios, { AxiosResponse, AxiosError } from "axios"
import WebFont from "webfontloader"

import { Chart } from "../class/Chart"
import { ChartPlayer } from "../class/ChartPlayer"
import { KeySoundPlayer } from "../class/KeySoundPlayer"
import { DebugGUI } from "../class/DebugGUI"
export class PlayScene extends Phaser.Scene {
    private debugGUI: DebugGUI
    private chart: Chart
    private chartPlayer: ChartPlayer

    private keySoundPlayer: KeySoundPlayer

    private loadEndTime?: Date

    private hasLoaded: boolean

    private debugText: Phaser.GameObjects.Text

    private judgeLine: Phaser.GameObjects.Rectangle

    private playingSec: number
    private beat: number

    private latestJudgeSec: number

    private noteSpeed: number = 100

    private keys: Phaser.Input.Keyboard.Key[]

    private background: Phaser.GameObjects.Shader
    private backgroundMask: Phaser.GameObjects.Rectangle
    private laneBackground: Phaser.GameObjects.Image
    private laneBackgroundLight: Phaser.GameObjects.Image

    private titleText: Phaser.GameObjects.Text
    private comboText: Phaser.GameObjects.Text

    private judgeText: Phaser.GameObjects.Image
    private judgeFSText: Phaser.GameObjects.Image

    private comboTween: Phaser.Tweens.Tween
    private judgeTween: Phaser.Tweens.Tween

    constructor() {
        super("play")
    }

    init() {
        this.cameras.main.fadeOut(0)
        this.debugGUI = new DebugGUI(this)

        this.loadEndTime = undefined

        this.hasLoaded = false

        this.latestJudgeSec = -1

        this.keys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
        ]
    }
    preload() { }

    create() {
        const urlParams = new URLSearchParams(document.location.search.substring(1))
        const url = urlParams.get("chart") as string
        axios
            .get(url)
            .then((response: AxiosResponse) => {
                const bmsSource = response.data
                this.chart = new Chart(bmsSource)
                this.chartPlayer = new ChartPlayer(this, this.chart)

                this.titleText.setText(this.chart.info.title)
                this.cameras.main.fadeIn(700)

                this.noteSpeed = 65000 / this.chart.beatToBPM(0)

                this.keySoundPlayer = new KeySoundPlayer(this.chart)
                this.keySoundPlayer.loadKeySounds(this, url)
                this.load.start()
            })
            .catch((error: AxiosError) => {
                console.log(error)
            })
        const { width, height } = this.game.canvas

        this.background = this.add
            .shader("background", width / 2, height / 2, 1280, 720)
            .setDepth(-10)
        this.backgroundMask = this.add
            .rectangle(width / 2, height / 2, 1280, 720, 0x000000, 230)
            .setDepth(-9)

        this.laneBackground = this.add
            .image(width / 2, height / 2, "frame-back")
            .setDisplaySize(1280, 720)
            .setDepth(-3)
        this.laneBackgroundLight = this.add.image(
            width / 2,
            height / 2,
            "frame-light"
        )
        this.laneBackgroundLight.setDisplaySize(1280, 720).setDepth(-2)
        this.load.start()

        this.judgeText = this.add.image(width / 2, 420, "judge-0").setVisible(false).setDepth(8)
        this.judgeFSText = this.add.image(width/2, 350, "judge-fast").setVisible(false).setDepth(8)

        this.judgeTween = this.tweens.add({
            targets: this.judgeText,
            duration: 1200,
            scale: {
                value: 0,
                duration: 1000,
                ease: (t: number):number => {
                    return t <= 0.08 ? 0.5*Math.pow(Math.sin(t * 3 /0.08), 3) : 0;
                }
            },
            alpha: {
                value: 0,
                duration: 1000,
                ease: (t: number):number => {
                    return 0;
                }
            }
        })

        this.add.text(0, 0, "play scene")
        this.debugText = this.add.text(0, 50, `ロード中`)

        //const testText = this.add.text(30, 110, "日本語test", { fontFamily: 'Zen Kaku Gothic New', fontSize: "30px", color: '#f0f0f0'}).setShadow(0, 0, "#080808", 4, false, true).setOrigin(0).setDepth(10)

        this.titleText = this.add
            .text(640, 180, "", {
                fontFamily: "Zen Kaku Gothic New",
                fontSize: "30px",
                color: "#f0f0f0",
            })
            .setShadow(0, 0, "#080808", 4, false, true)
            .setOrigin(0.5)
            .setDepth(-3)
            .setAlpha(1.0)
        this.comboText = this.add
            .text(1150, 130, "", {
                fontFamily: "Bungee",
                fontSize: "120px",
                color: "#fafafa",
                align: "center",
            })
            .setShadow(0, 0, "#fafafa", 12, false, true)
            .setOrigin(0.5)
            .setDepth(9)
            .setAlpha(0.7)
        this.comboTween = this.tweens.add({
            targets: this.comboText,
            y: 100,
            alpha: { value: 1, duration: 70, ease: "Quintic.Out" },
            ease: "Quintic.Out",
            duration: 70,
            paused: false,
        })

        const zone = this.add.zone(width / 2, height / 2, width, height)
        zone.setInteractive({
            useHandCursor: true,
        })
        zone.on("pointerdown", () => {
            //this.scene.start("title")
        })

        this.load.on("progress", (value: number) => {
            //console.log(value)
            this.debugText.setText(`${value}`)
        })
        this.load.on("complete", () => {
            this.hasLoaded = true
            this.loadEndTime = new Date()

            this.tweens.add({
                targets: this.titleText,
                alpha: { value: 0.2, duration: 1000, ease: "Linear" },
            })
        })
    }
    update(time: number, dt: number) {
        this.laneBackgroundLight.setAlpha(
            0.95 + 0.6 * (-this.beat - Math.floor(1 - this.beat))
        )

        if (this.hasLoaded && this.loadEndTime !== undefined) {
            // draw combo
            if (this.comboText.text !== `${this.chartPlayer.combo}`) {

            }
            this.comboText.setShadowBlur(
                12 + 8 * (-this.beat - Math.floor(1 - this.beat))
            )

            // draw judge
            if (this.latestJudgeSec !== this.chartPlayer.latestJudgeSec) {
                this.comboText.setText(`${this.chartPlayer.combo}`)
                this.comboTween.restart()
                this.latestJudgeSec = this.chartPlayer.latestJudgeSec
                this.judgeText.setTexture(`judge-${this.chartPlayer.latestJudgeIndex}`)
                this.judgeText.setVisible(true)
                this.judgeTween.restart()
                //this.judgeText.setAlpha(1)
                if (this.chartPlayer.latestJudgeIndex !== 0) {
                    this.judgeFSText.setTexture(`judge-${this.chartPlayer.latestJudgeDiff > 0 ? "fast" : "slow"}`)
                    this.judgeFSText.setVisible(true)
                } else {
                    this.judgeFSText.setVisible(false)
                }
            }

            // update note
            this.playingSec =
                (new Date().getTime() - this.loadEndTime.getTime()) / 1000
            this.beat = this.chart.secondsToBeat(this.playingSec)

            this.chartPlayer.update(
                this,
                this.beat,
                this.playingSec,
                this.noteSpeed,
                this.keySoundPlayer
            )

            // key down
            for (const laneIndex of Array(7).keys()) {
                if (Phaser.Input.Keyboard.JustDown(this.keys[laneIndex])) {
                    this.chartPlayer.judgeKeyDown(
                        this,
                        this.playingSec,
                        laneIndex,
                        this.keySoundPlayer
                    )
                }
            }

            // key hold
            for (const laneIndex of Array(7).keys()) {
                if (
                    this.chartPlayer.isHolds[laneIndex] &&
                    !this.keys[laneIndex].isDown
                ) {
                    this.chartPlayer.judgeKeyHold(this.playingSec, laneIndex)
                }
            }
            // debug
            this.debugText.setText(
                `${this.latestJudgeSec}\n\nFPS:${(1000 / dt).toFixed(2)}\n\nGenre:${this.chart.info.genre
                }\nTitle:${this.chart.info.title}\nSub Title:${this.chart.info.subtitle
                }\nArtist:${this.chart.info.artist}\nSub Artist:${this.chart.info.subartist
                }\nDifficulty:${this.chart.info.difficulty}\nLevei:${this.chart.info.level
                }\n\nSec:${this.playingSec}\nBeat:${this.beat.toFixed(
                    2
                )}\nBPM:${this.chart.beatToBPM(this.beat).toFixed(2)}\nCombo:${this.chartPlayer.combo
                }\nMax Combo:${this.chartPlayer.maxCombo}\nLatest Judge:${this.chartPlayer.latestJudgeIndex
                }\nJudges:${this.chartPlayer.judges
                }\nFinished?:${this.chartPlayer.hasFinished(this.beat)}`
            )
        }
    }
}
