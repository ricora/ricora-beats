import bms from "bms"
import axios, { AxiosResponse, AxiosError } from "axios"
import WebFont from "webfontloader"

import { Chart } from "../class/Chart"
import { ChartPlayer } from "../class/ChartPlayer"
import { KeySoundPlayer } from "../class/KeySoundPlayer"
import { DebugGUI } from "../class/DebugGUI"
import { PlayResult } from "../class/PlayResult"
import { PlayConfig } from "../class/PlayConfig"
import { Beatmap, Music } from "../class/Music"
export class PlayScene extends Phaser.Scene {
    private debugGUI: DebugGUI
    private beatmap: Beatmap
    private music: Music

    private chart: Chart
    private chartPlayer?: ChartPlayer

    private keySoundPlayer: KeySoundPlayer

    private loadEndTime?: Date

    private hasLoaded: boolean
    private hasFadedOut: boolean

    private debugText: Phaser.GameObjects.Text

    private judgeLine: Phaser.GameObjects.Rectangle

    private playingSec: number
    private beat: number

    private latestJudgeSec: number

    private isTouching: boolean[]

    private noteSpeed: number = 100

    private keys: Phaser.Input.Keyboard.Key[]

    private screenMask: Phaser.GameObjects.Rectangle

    private background: Phaser.GameObjects.Shader
    private backgroundMask: Phaser.GameObjects.Rectangle
    private laneBackground: Phaser.GameObjects.Image
    private laneBackgroundLight: Phaser.GameObjects.Image
    private laneMainFrame: Phaser.GameObjects.Image
    private laneMainFrameLight: Phaser.GameObjects.Image

    private judgeBar: Phaser.GameObjects.Image

    private titleText: Phaser.GameObjects.Text
    private artistText: Phaser.GameObjects.Text

    private comboText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text

    private judgeText: Phaser.GameObjects.Image
    private judgeFSText: Phaser.GameObjects.Image

    private keyFlashes: Phaser.GameObjects.Image[]

    private backIcon: Phaser.GameObjects.Image

    private hasRetired: boolean

    private comboTween: Phaser.Tweens.Tween
    private judgeTween: Phaser.Tweens.Tween

    private keyFlashTweens: Phaser.Tweens.Tween[]

    private holdParticleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[]

    private inputZones: Phaser.GameObjects.Zone[]

    private particleYellow: Phaser.GameObjects.Particles.ParticleEmitterManager

    private normalTapSounds: Phaser.Sound.BaseSound[]

    private playConfig: PlayConfig

    constructor() {
        super("play")
    }

    init(data: any) {
        this.debugGUI = new DebugGUI(this)

        this.loadEndTime = undefined

        this.hasLoaded = false

        this.hasFadedOut = false

        this.hasRetired = false

        this.latestJudgeSec = -1

        this.chartPlayer = undefined

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

        this.music = data.music
        this.beatmap = data.beatmap

        this.playConfig = data.playConfig
    }
    preload() { }

    create() {
        const urlParams = new URLSearchParams(document.location.search.substring(1))
        const url = `./assets/beatmaps/${this.music.folder}/${this.beatmap.filename}`

        const { width, height } = this.game.canvas

        this.screenMask = this.add
            .rectangle(width / 2, height / 2, 1280, 720, 0x000000)
            .setDepth(100)

        axios
            .get(url)
            .then((response: AxiosResponse) => {
                const bmsSource = response.data
                this.chart = new Chart(bmsSource)
                this.chartPlayer = new ChartPlayer(
                    this,
                    this.chart,
                    this.playConfig.key,
                    this.playConfig
                )

                this.titleText.setText(this.music.title)
                this.artistText.setText(this.music.artist)

                this.noteSpeed =
                    (this.playConfig.noteSpeed * 10000) / this.chart.beatToBPM(0)

                this.keySoundPlayer = new KeySoundPlayer(this.chart)
                this.keySoundPlayer.loadKeySounds(this, url)
                this.load.start()
            })
            .catch((error: AxiosError) => {
                console.log(error)
            })

        this.background = this.add
            .shader("background", width / 2, height / 2, 1280, 720)
            .setDepth(-10)
        this.backgroundMask = this.add
            .rectangle(width / 2, height / 2, 760, 720, 0x000000, 70)
            .setDepth(-9)

        this.laneBackground = this.add
            .image(width / 2, height / 2, "frame-back")
            .setDisplaySize(1280, 720)
            .setDepth(-5)
        this.laneBackgroundLight = this.add
            .image(width / 2, height / 2, "frame-back-light-yellow")
            .setDisplaySize(1280, 720)
            .setDepth(-4)
        this.laneMainFrame = this.add
            .image(width / 2, height / 2, "frame-main")
            .setDisplaySize(1280, 720)
            .setDepth(-3)
        this.laneMainFrameLight = this.add
            .image(width / 2, height / 2, "frame-main-light")
            .setDisplaySize(1280, 720)
            .setDepth(-2)

        this.judgeBar = this.add
            .image(width / 2, 640, "judgebar")
            .setDisplaySize(780, 14)
            .setDepth(-4)

        this.judgeText = this.add
            .image(width / 2, 500, "judge-0")
            .setVisible(false)
            .setDepth(8)
        this.judgeFSText = this.add
            .image(width / 2, 290, "judge-fast")
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
            .text(640, 180, "", {
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
            y: 210,
            ease: (t: number): number => {
                return 0 < t && t <= 1 ? 1 - t : 0
            },
            duration: 100,
            paused: false,
            onComplete: () => {
                this.comboText.setY(180)
            },
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
        this.particleYellow = this.add.particles("particle-yellow")

        for (const laneIndex of Array(7).keys()) {
            let positionX = -1280
            let widths = { 4: 186, 5: 148.5, 6: 124, 7: 106 }

            if (this.playConfig.key == 4) {
                if (1 <= laneIndex && laneIndex <= 2) {
                    positionX = 361 + 186 * (laneIndex - 1)
                } else if (4 <= laneIndex && laneIndex <= 5) {
                    positionX = 361 + 186 * (laneIndex - 2)
                }
            } else if (this.playConfig.key == 5) {
                if (1 <= laneIndex && laneIndex <= 5) {
                    positionX = 343 + 148.5 * (laneIndex - 1)
                }
            } else if (this.playConfig.key == 6) {
                if (laneIndex <= 2) {
                    positionX = 330 + 124 * laneIndex
                } else if (4 <= laneIndex) {
                    positionX = 330 + 124 * (laneIndex - 1)
                }
            } else if (this.playConfig.key == 7) {
                positionX = 322 + 106 * laneIndex
            }

            this.keyFlashTweens.push(
                this.tweens.add({
                    targets: this.add
                        .image(positionX, 720, "key-flash")
                        .setOrigin(0.5, 1)
                        .setDisplaySize((900 / this.playConfig.key) * 1.02, 720)
                        .setDepth(-2),
                    scaleX: { value: 0, duration: 80, ease: "Linear" },
                    ease: "Quintic.Out",
                    paused: false,
                })
            )
            this.holdParticleEmitters.push(
                this.particleYellow.createEmitter({
                    x: positionX - widths[this.playConfig.key] / 2,
                    y: 640,
                    angle: { min: 265, max: 275 },
                    speed: 400,
                    emitZone: {
                        type: "random",
                        source: new Phaser.Geom.Rectangle(
                            0,
                            0,
                            widths[this.playConfig.key],
                            1
                        ),
                        quantity: 48,
                        yoyo: false,
                    },
                    gravityY: -200,
                    scale: { start: 0.2, end: 0 },
                    lifespan: { min: 100, max: 350 },
                    quantity: 1.5,
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
                        this.judgeKeyDown(laneIndex)
                    })
                    .on("pointerout", () => {
                        this.isTouching[laneIndex] = false
                    })
            )
        }

        this.debugText = this.add.text(0, 450, "")

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

        this.add
            .image(10, 280, `key-icon-${this.playConfig.key}`)
            .setOrigin(0, 0.5)
            .setDepth(10)
            .setScale(0.7)

        this.add
            .image(10, 310, `diff-icon-${this.playConfig.difficulty}`)
            .setOrigin(0, 0.5)
            .setDepth(10)
            .setScale(0.7)

        //this.add.image(80,140,"jacket-test").setOrigin(0.5,0.5).setDepth(10).setDisplaySize(140,140)

        this.backIcon = this.add
            .image(10, 10, "icon-back")
            .setOrigin(0, 0)
            .setDepth(10)
            .setScale(0.6)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.cameras.main.fadeOut(500)
                this.hasRetired = true
            })

        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                if (
                    this.chartPlayer !== undefined &&
                    this.chartPlayer.hasFinished(this.beat) &&
                    this.chartPlayer !== undefined
                ) {
                    this.scene.start("result", {
                        playResult: new PlayResult({
                            music: this.music,
                            playConfig: this.playConfig,
                            judges: this.chartPlayer.judges,
                            score: this.chartPlayer.score,
                            maxCombo: Math.max(
                                this.chartPlayer.combo,
                                this.chartPlayer.combo
                            ),
                        }),
                    })
                } else if (this.hasRetired) {
                    this.scene.start("select")
                }
            }
        )

        this.normalTapSounds = []
        for (const judgeIndex of Array(5).keys()) {
            this.normalTapSounds.push(this.sound.add(`normal-tap-${judgeIndex + 1}`))
        }

        this.load.on("progress", (value: number) => {
            //console.log(value)
            this.debugText.setText(`${value}`)
        })
        this.load.on("complete", () => {
            this.hasLoaded = true
            this.loadEndTime = new Date()
            this.cameras.main.fadeIn(500)
        })
    }
    update(time: number, dt: number) {
        this.laneMainFrameLight.setAlpha(
            1 - 0.6 * ((this.beat % 1) % 1) //0.95 + 0.6 * (-this.beat - Math.floor(1 - this.beat))
        )
        this.laneBackgroundLight.setAlpha(
            0.5 + 0.25 * 0.5 * (Math.sin(1 * Math.PI * this.beat) + 1)
        )

        if (
            this.hasLoaded &&
            this.loadEndTime !== undefined &&
            this.chartPlayer !== undefined
        ) {
            this.screenMask.setVisible(false)
            if (
                this.latestJudgeSec !== this.chartPlayer.latestJudgeSec &&
                this.chartPlayer.latestJudgeSec !== undefined
            ) {
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
                this.normalTapSounds[this.chartPlayer.latestJudgeIndex].play()

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
                (new Date().getTime() - this.loadEndTime.getTime() - 3000) / 1000
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

            // change back light
            if (this.chartPlayer.judges[3] == 0 && this.chartPlayer.judges[4] == 0) {
                if (
                    this.chartPlayer.judges[1] == 0 &&
                    this.chartPlayer.judges[2] == 0
                ) {
                    this.laneBackgroundLight.setTexture("frame-back-light-yellow")
                } else {
                    this.laneBackgroundLight.setTexture("frame-back-light-blue")
                }
            } else {
                this.laneBackgroundLight.setTexture("frame-back-light-green")
            }

            // finish
            if (this.chartPlayer.hasFinished(this.beat) && !this.hasFadedOut) {
                this.cameras.main.fadeOut(500)

                this.hasFadedOut = true
            }

            // key down
            for (const laneIndex of Array(7).keys()) {
                if (Phaser.Input.Keyboard.JustDown(this.keys[laneIndex])) {
                    this.judgeKeyDown(laneIndex)
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
                if (this.chartPlayer.isHolds[laneIndex] && time % 130 <= 17) {
                    this.addBomb(laneIndex)
                }
            }

            // debug
            this.debugText.setText(`${time}\n\nFPS:${(1000 / dt).toFixed(2)}`)
        } else {
            for (const laneIndex of Array(7).keys()) {
                this.keyFlashTweens[laneIndex].restart()
            }
            this.screenMask.setVisible(true)
        }
    }
    private judgeKeyDown(laneIndex: number) {
        if (this.chartPlayer !== undefined) {
            if (
                this.chartPlayer.judgeKeyDown(
                    this,
                    this.playingSec,
                    laneIndex,
                    this.keySoundPlayer
                )
            ) {
                if (this.chartPlayer.latestJudgeIndex <= 2) {
                    this.addBomb(laneIndex)
                }
            }
        }
    }
    private addBomb(laneIndex: number) {
        let positionX = -1200
        if (this.playConfig.key == 4) {
            if (1 <= laneIndex && laneIndex <= 2) {
                positionX = 361 + 186 * (laneIndex - 1)
            } else if (4 <= laneIndex && laneIndex <= 5) {
                positionX = 361 + 186 * (laneIndex - 2)
            }
        } else if (this.playConfig.key == 5) {
            if (1 <= laneIndex && laneIndex <= 5) {
                positionX = 343 + 148.5 * (laneIndex - 1)
            }
        } else if (this.playConfig.key == 6) {
            if (laneIndex <= 2) {
                positionX = 330 + 124 * laneIndex
            } else if (4 <= laneIndex) {
                positionX = 330 + 124 * (laneIndex - 1)
            }
        } else if (this.playConfig.key == 7) {
            positionX = 322 + 106 * laneIndex
        }
        this.tweens.add({
            targets: this.add
                .image(positionX, 640, "bomb-2")
                .setDisplaySize(256, 256)
                .setAlpha(0.5),
            alpha: { value: 0, duration: 280, ease: "Linear" },
            scale: { value: 0.9, duration: 280, ease: "Linear" },
            angle: { value: 30, duration: 280, ease: "Linear" },
            paused: false,
        })
        this.tweens.add({
            targets: this.add
                .image(positionX, 640, "bomb-3")
                .setDisplaySize(180, 180),
            alpha: { value: 0, duration: 140, ease: "Linear" },
            scale: { value: 0.4, duration: 110, ease: "Quintic.Out" },
            paused: false,
        })
        this.tweens.add({
            targets: this.add
                .image(positionX, 640, "bomb-1")
                .setDisplaySize(196, 196),
            alpha: { value: 0, duration: 120, ease: "Linear" },
            scale: { value: 0.7, duration: 120, ease: "Linear" },
            paused: false,
        })
    }
}
