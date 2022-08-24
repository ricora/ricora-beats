import bms from "bms"
import axios, { AxiosResponse, AxiosError } from "axios"

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

    private noteSpeed: number = 100

    private keys: Phaser.Input.Keyboard.Key[]

    private laneBackgrounds: Phaser.GameObjects.Rectangle[]
    private laneBackgroundColors: number[] = [
        0x330d09, 0x333109, 0x123309, 0x093325, 0x091e33, 0x190933, 0x33092a,
    ]

    constructor() {
        super("play")
    }

    init() {
        this.debugGUI = new DebugGUI(this)

        this.loadEndTime = undefined

        this.hasLoaded = false

        this.keys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
        ]

        this.laneBackgrounds = [...Array(7)].map((_, i) =>
            this.add
                .rectangle(
                    300 + 100 * i,
                    360,
                    100,
                    720,
                    this.laneBackgroundColors[i],
                    128
                )
                .setDepth(-2)
        )
    }
    preload() {


    }

    create() {
        const urlParams = new URLSearchParams(document.location.search.substring(1))
        const url = urlParams.get("chart") as string
        axios
            .get(url)
            .then((response: AxiosResponse) => {
                const bmsSource = response.data
                this.chart = new Chart(bmsSource)
                this.chartPlayer = new ChartPlayer(this, this.chart)

                this.noteSpeed = 75000 / this.chart.beatToBPM(0)

                this.keySoundPlayer = new KeySoundPlayer(this.chart)
                this.keySoundPlayer.loadKeySounds(this, url)
                this.load.start()
            })
            .catch((error: AxiosError) => {
                console.log(error)
            })
        const { width, height } = this.game.canvas

        this.add.text(0, 0, "play scene")
        this.debugText = this.add.text(0, 50, `ロード中`)

        this.judgeLine = this.add.rectangle(640, 600, 1280, 10, 0xff0000)

        const zone = this.add.zone(width / 2, height / 2, width, height)
        zone.setInteractive({
            useHandCursor: true,
        })
        zone.on("pointerdown", () => {
            //this.scene.start("title")
        })
    }
    update(time: number, dt: number) {
        this.load.on("progress", (value: number) => {
            //console.log(value)
        })
        this.load.on("complete", () => {
            this.hasLoaded = true
            this.loadEndTime = new Date()
        })

        if (this.hasLoaded && this.loadEndTime !== undefined) {
            this.playingSec =
                (new Date().getTime() - this.loadEndTime.getTime()) / 1000
            this.beat = this.chart.secondsToBeat(this.playingSec)
            this.debugText.setText(
                `FPS:${(1000/dt).toFixed(2)}\n\nGenre:${this.chart.info.genre}\nTitle:${this.chart.info.title
                }\nSub Title:${this.chart.info.subtitle}\nArtist:${this.chart.info.artist
                }\nSub Artist:${this.chart.info.subartist}\nDifficulty:${this.chart.info.difficulty
                }\nLevei:${this.chart.info.level}\n\nSec:${this.playingSec
                }\nBeat:${this.beat.toFixed(2)}\nBPM:${this.chart.beatToBPM(this.beat).toFixed(2)}\nCombo:${this.chartPlayer.combo
                }\nMax Combo:${this.chartPlayer.maxCombo}\nLatest Judge:${this.chartPlayer.latestJudgeIndex
                }\nJudges:${this.chartPlayer.judges}\nFinished?:${this.chartPlayer.hasFinished(this.beat)}`
            )

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
        }
    }
}
