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

    private isTouching: boolean[]

    private noteSpeed: number = 100

    private keys: Phaser.Input.Keyboard.Key[]

    private background: Phaser.GameObjects.Shader
    private backgroundMask: Phaser.GameObjects.Rectangle
    private laneBackground: Phaser.GameObjects.Image
    private laneBackgroundLight: Phaser.GameObjects.Image

    private titleText: Phaser.GameObjects.Text
    private artistText: Phaser.GameObjects.Text

    private comboText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text

    private judgeText: Phaser.GameObjects.Image
    private judgeFSText: Phaser.GameObjects.Image

    private keyFlashes: Phaser.GameObjects.Image[]

    private comboTween: Phaser.Tweens.Tween
    private judgeTween: Phaser.Tweens.Tween

    private keyFlashTweens: Phaser.Tweens.Tween[]

    private holdParticleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[]

    private inputZones: Phaser.GameObjects.Zone[]

    constructor() {
        super("play")
    }

    init() {
        this.cameras.main.fadeOut(0)
        this.debugGUI = new DebugGUI(this)

        this.loadEndTime = undefined

        this.hasLoaded = false

        this.latestJudgeSec = -1

        this.isTouching = new Array<boolean>(7).fill(false)

        this.keys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
        ]

        this.input.addPointer(9)
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
                this.artistText.setText(this.chart.info.artist)
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
            .rectangle(width / 2, height / 2, 760, 720, 0x000000, 70)
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

        this.judgeText = this.add
            .image(width / 2, 420, "judge-0")
            .setVisible(false)
            .setDepth(8)
        this.judgeFSText = this.add
            .image(width / 2, 350, "judge-fast")
            .setVisible(false)
            .setDepth(8)

        this.judgeTween = this.tweens.add({
            targets: this.judgeText,
            duration: 1200,
            scale: {
                value: 0,
                duration: 1000,
                ease: (t: number): number => {
                    return t <= 0.08 ? 0.5 * Math.pow(Math.sin((t * 3) / 0.08), 3) : 0
                },
            },
            alpha: {
                value: 0,
                duration: 1000,
                ease: (t: number): number => {
                    return 0
                },
            },
        })

        this.comboText = this.add
            .text(640, 200, "", {
                fontFamily: "Bungee",
                fontSize: "120px",
                color: "#fafafa",
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(0)
            .setAlpha(0.5)
        this.comboTween = this.tweens.add({
            targets: this.comboText,
            y: 170,
            ease: "Quintic.Out",
            duration: 70,
            paused: false,
        })

        this.scoreText = this.add
            .text(640, 100, "0.00%", {
                fontFamily: "Bungee",
                fontSize: "80px",
                color: "#888888",
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(0)
            .setAlpha(0.5)
            .setScale(0.5)

        this.keyFlashTweens = []
        this.holdParticleEmitters = []
        const particle = this.add.particles("particle")

        for (const laneIndex of Array(7).keys()) {
            this.keyFlashTweens.push(
                this.tweens.add({
                    targets: this.add
                        .image(319 + 106.8 * laneIndex, 720, "key-flash")
                        .setOrigin(0.5, 1)
                        .setDisplaySize(900 / 7, 720)
                        .setDepth(-2)
                        .setAlpha(1),
                    scaleX: { value: 0, duration: 80, ease: "Linear" },
                    ease: "Quintic.Out",
                    paused: false,
                })
            )
            this.holdParticleEmitters.push(
                particle.createEmitter({
                    x: 319 - 53.4 + 106.8 * laneIndex,
                    y: 551,
                    angle: { min: 265, max: 275 },
                    speed: 400,
                    emitZone: {
                        type: "random",
                        source: new Phaser.Geom.Rectangle(0, 0, 100, 1),
                        quantity: 48,
                        yoyo: false,
                    },
                    gravityY: -200,
                    scale: { start: 0.2, end: 0 },
                    lifespan: { min: 100, max: 250 },
                    quantity: 1,
                    blendMode: "ADD",
                    on: false,
                })
            )
        }

        this.inputZones = []
        for (const laneIndex of Array(7).keys()) {
            this.inputZones.push(
                this.add
                    .zone(319 + 106.8 * laneIndex, 720, 106.8, 720)
                    .setInteractive()
                    .setOrigin(0.5, 1)
                    .on("pointerover", () => {
                        this.isTouching[laneIndex] = true
                    })
                    .on("pointerout", () => {
                        this.isTouching[laneIndex] = false
                    })
            )
        }

        this.debugText = this.add.text(0, 250, `ロード中`)

        this.titleText = this.add
            .text(10, 230, "", {
                fontFamily: "Noto Sans JP",
                fontSize: "28px",
                color: "#f0f0f0",
            })
            .setShadow(0, 0, "#080808", 4, false, true)
            .setOrigin(0, 0.5)
            .setDepth(10)
            .setScale(0.5)

        this.artistText = this.add
            .text(10, 250, "", {
                fontFamily: "Noto Sans JP",
                fontSize: "20px",
                color: "#f0f0f0",
            })
            .setShadow(0, 0, "#080808", 4, false, true)
            .setOrigin(0, 0.5)
            .setDepth(10)
            .setScale(0.5)

        this.add
            .rectangle(80, 140, 142, 142, 0xffffff)
            .setDepth(9)
            .setOrigin(0.5, 0.5)

        //this.add.image(80,140,"jacket-test").setOrigin(0.5,0.5).setDepth(10).setDisplaySize(140,140)

        this.load.on("progress", (value: number) => {
            //console.log(value)
            this.debugText.setText(`${value}`)
        })
        this.load.on("complete", () => {
            this.hasLoaded = true
            this.loadEndTime = new Date()
        })
    }
    update(time: number, dt: number) {
        this.laneBackgroundLight.setAlpha(
            0.95 + 0.6 * (-this.beat - Math.floor(1 - this.beat))
        )

        if (this.hasLoaded && this.loadEndTime !== undefined) {
            if (this.latestJudgeSec !== this.chartPlayer.latestJudgeSec) {
                // draw score
                this.scoreText.setText(`${this.chartPlayer.score.toFixed(2)}%`)

                // draw combo
                this.comboText.setText(`${this.chartPlayer.combo}`)
                this.comboTween.restart()
                // draw judge
                this.latestJudgeSec = this.chartPlayer.latestJudgeSec
                this.judgeText.setTexture(`judge-${this.chartPlayer.latestJudgeIndex}`)
                this.judgeText.setVisible(true)
                this.judgeTween.restart()
                //this.judgeText.setAlpha(1)
                if (this.chartPlayer.latestJudgeIndex !== 0) {
                    this.judgeFSText.setTexture(
                        `judge-${this.chartPlayer.latestJudgeDiff > 0 ? "fast" : "slow"}`
                    )
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

            for (const laneIndex of Array(7).keys()) {
                if (this.keys[laneIndex].isDown || this.isTouching[laneIndex]) {
                    this.keyFlashTweens[laneIndex].restart()
                }
            }

            // key down
            for (const laneIndex of Array(7).keys()) {
                if (
                    Phaser.Input.Keyboard.JustDown(this.keys[laneIndex]) ||
                    this.isTouching[laneIndex]
                ) {
                    if (
                        this.chartPlayer.judgeKeyDown(
                            this,
                            this.playingSec,
                            laneIndex,
                            this.keySoundPlayer
                        )
                    ) {
                        if (this.chartPlayer.latestJudgeIndex <= 2) {
                            this.tweens.add({
                                targets: this.add
                                    .image(319 + 106.8 * laneIndex, 551, "bomb-2")
                                    .setDisplaySize(256, 256)
                                    .setAlpha(0.5),
                                alpha: { value: 0, duration: 280, ease: "Linear" },
                                scale: { value: 0.7, duration: 280, ease: "Linear" },
                                angle: { value: 30, duration: 280, ease: "Linear" },
                                paused: false,
                            })
                            this.tweens.add({
                                targets: this.add
                                    .image(319 + 106.8 * laneIndex, 551, "bomb-3")
                                    .setDisplaySize(162, 162),
                                alpha: { value: 0, duration: 120, ease: "Linear" },
                                scale: { value: 0.4, duration: 100, ease: "Quintic.Out" },
                                paused: false,
                            })
                            this.tweens.add({
                                targets: this.add
                                    .image(319 + 106.8 * laneIndex, 551, "bomb-1")
                                    .setDisplaySize(196, 196),
                                alpha: { value: 0, duration: 120, ease: "Linear" },
                                scale: { value: 0.5, duration: 120, ease: "Linear" },
                                paused: false,
                            })
                        }
                    }
                }
            }

            // key hold
            for (const laneIndex of Array(7).keys()) {
                if (
                    this.chartPlayer.isHolds[laneIndex] &&
                    !this.keys[laneIndex].isDown &&
                    !this.isTouching[laneIndex]
                ) {
                    this.chartPlayer.judgeKeyHold(this.playingSec, laneIndex)
                }
                this.holdParticleEmitters[laneIndex].on =
                    this.chartPlayer.isHolds[laneIndex]
            }

            // debug
            this.debugText.setText(
                `${this.chartPlayer.score}\n\nFPS:${(1000 / dt).toFixed(2)}\n\nGenre:${this.chart.info.genre
                }\nTitle:${this.chart.info.title}\nSub Title:${this.chart.info.subtitle
                }\nArtist:${this.chart.info.artist}\nSub Artist:${this.chart.info.subartist
                }\nDifficulty:${this.chart.info.difficulty}\nLevei:${this.chart.info.level
                }\n\nSec:${this.playingSec}\nBeat:${this.beat.toFixed(
                    2
                )}\nBPM:${this.chart.beatToBPM(this.beat).toFixed(2)}\nCombo:${this.chartPlayer.combo
                }\nMax Combo:${this.chartPlayer.maxCombo}\nLatest Judge:${this.chartPlayer.latestJudgeIndex
                }\nScore:${this.chartPlayer.score}\nJudges:${this.chartPlayer.judges
                }\nFinished?:${this.chartPlayer.hasFinished(this.beat)}`
            )
        }
    }
}
