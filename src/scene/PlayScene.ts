import bms from "bms"
import axios, { type AxiosResponse, type AxiosError } from "axios"
import WebFont from "webfontloader"

import { Chart } from "../class/Chart"
import { ChartPlayer } from "../class/ChartPlayer"
import { KeySoundPlayer } from "../class/KeySoundPlayer"
import { DebugGUI } from "../class/DebugGUI"
import { PlayResult } from "../class/PlayResult"
import { type PlayConfig } from "../class/PlayConfig"
import { type Beatmap, type Music } from "../class/Music"
export class PlayScene extends Phaser.Scene {
  private debugGUI: DebugGUI
  private beatmap: Beatmap
  private music: Music

  private chart: Chart
  private chartPlayer?: ChartPlayer

  private keySoundPlayer: KeySoundPlayer

  private loadEndTime?: Date

  private isLoading: boolean
  private hasLoaded: boolean
  private hasFadedOut: boolean

  private debugText: Phaser.GameObjects.Text

  private playingSec: number
  private beat: number

  private latestJudgeSec: number

  private isTouching: boolean[]

  private noteSpeed: number = 100

  private keys: Phaser.Input.Keyboard.Key[] | null
  private keyLabels: Phaser.GameObjects.Text[]

  private screenMask: Phaser.GameObjects.Rectangle

  private background: Phaser.GameObjects.Shader
  private backgroundMask: Phaser.GameObjects.Rectangle
  private laneBackground: Phaser.GameObjects.Image
  private laneBackgroundLight: Phaser.GameObjects.Image
  private laneMainFrame: Phaser.GameObjects.Image
  private laneMainFrameLight: Phaser.GameObjects.Image

  private judgeBar: Phaser.GameObjects.Image
  private judgeBarLight: Phaser.GameObjects.Image

  private musicFrame: Phaser.GameObjects.Image
  private musicFrameLabelText: Phaser.GameObjects.Text
  private titleText: Phaser.GameObjects.Text
  private artistText: Phaser.GameObjects.Text
  private keyIcon: Phaser.GameObjects.Image
  private diffIcon: Phaser.GameObjects.Image

  private comboText: Phaser.GameObjects.Text
  private scoreText: Phaser.GameObjects.Text

  private startText: Phaser.GameObjects.Text

  private judgeText: Phaser.GameObjects.Image
  private judgeFSText: Phaser.GameObjects.Image

  private readonly keyFlashes: Phaser.GameObjects.Image[]

  private jacketImage: Phaser.GameObjects.Image

  private backButton: Phaser.GameObjects.Image

  private hasRetired: boolean

  private comboTween: Phaser.Tweens.Tween
  private judgeTween: Phaser.Tweens.Tween

  private keyFlashTweens: Phaser.Tweens.Tween[]

  private holdParticleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[]

  private inputZones: Phaser.GameObjects.Zone[]

  private normalTapSounds: Phaser.Sound.BaseSound[]

  private playConfig: PlayConfig

  constructor() {
    super("play")
  }

  init(data: any) {
    this.debugGUI = new DebugGUI(this)

    this.loadEndTime = undefined

    this.isLoading = false

    this.hasLoaded = false

    this.hasFadedOut = false

    this.hasRetired = false

    this.latestJudgeSec = -1

    this.chartPlayer = undefined

    this.isTouching = new Array<boolean>(7).fill(false)

    if (this.input.keyboard !== null) {
      this.keys = [
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      ]
    } else {
      this.keys = null
    }

    this.input.addPointer(9)

    this.music = data.music
    this.beatmap = data.beatmap

    this.playConfig = data.playConfig
  }

  preload() {}

  create() {
    const urlParams = new URLSearchParams(document.location.search.substring(1))
    const url = `./assets/beatmaps/${this.music.folder}/${this.beatmap.filename}`

    const { width, height } = this.game.canvas

    this.screenMask = this.add.rectangle(width / 2, height / 2, 1280, 720, 0x000000).setDepth(100)

    axios
      .get(url)
      .then((response: AxiosResponse) => {
        const bmsSource = response.data
        this.chart = new Chart(bmsSource)
        this.chartPlayer = new ChartPlayer(this, this.chart, this.playConfig.key, this.playConfig)

        this.titleText.setText(this.music.title)
        this.artistText.setText(this.music.artist)

        this.noteSpeed = (this.playConfig.noteSpeed * 10000) / this.chart.beatToBPM(0)

        this.keySoundPlayer = new KeySoundPlayer(this.chart)
        this.keySoundPlayer.loadKeySounds(this, url)
        this.load.start()
        this.isLoading = true
      })
      .catch((error: AxiosError) => {
        console.log(error)
      })

    this.background = this.add.shader("background", width / 2, height / 2, 1280, 720).setDepth(-10)
    this.backgroundMask = this.add
      .rectangle(width / 2, height / 2, 760, 720, 0x000000, 70)
      .setDepth(-9)
      .setScale(0, 1)

    this.laneBackground = this.add
      .image(width / 2, height / 2, "frame-back")
      .setDisplaySize(0, 720)
      .setDepth(-5)
    this.laneBackgroundLight = this.add
      .image(width / 2, height / 2, "frame-back-light-yellow")
      .setDisplaySize(0, 720)
      .setDepth(-4)
    this.laneMainFrame = this.add
      .image(width / 2, height / 2, "frame-main")
      .setDisplaySize(0, 720)
      .setDepth(-3)
    this.laneMainFrameLight = this.add
      .image(width / 2, height / 2, "frame-main-light")
      .setDisplaySize(0, 720)
      .setDepth(-2)

    this.judgeBar = this.add
      .image(width / 2, 640, "judgebar")
      .setDisplaySize(780, 14)
      .setDepth(-4)
      .setAlpha(0)
    this.judgeBarLight = this.add
      .image(width / 2, 640, "judgebar-light")
      .setDisplaySize(837, 50)
      .setDepth(-4)
      .setAlpha(0)

    this.judgeText = this.add
      .image(width / 2, 500, "judge-0")
      .setVisible(false)
      .setDepth(8)
    this.judgeFSText = this.add
      .image(width / 2, 290, "judge-fast")
      .setVisible(false)
      .setDepth(8)

    this.judgeTween = this.tweens.add({
      persist: true,
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
      persist: true,
      targets: this.comboText,
      y: 210,
      ease: (t: number): number => {
        return t > 0 && t <= 1 ? 1 - t : 0
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

    this.startText = this.add
      .text(640, 380, "GET READY...", {
        fontFamily: "Bungee",
        fontSize: "120px",
        color: "#fafafa",
        align: "center",
      })
      .setShadow(0, 0, "#111111", 20, true, true)
      .setOrigin(0.5)
      .setDepth(10)
      .setAlpha(1)
      .setScale(0.5)

    this.keyFlashTweens = []
    this.holdParticleEmitters = []
    this.inputZones = []
    this.keyLabels = []

    for (const laneIndex of Array(7).keys()) {
      let positionX = -1280
      const widths = { 4: 186, 5: 148.5, 6: 124, 7: 106 }

      if (this.playConfig.key == 4) {
        if (laneIndex >= 1 && laneIndex <= 2) {
          positionX = 361 + 186 * (laneIndex - 1)
        } else if (laneIndex >= 4 && laneIndex <= 5) {
          positionX = 361 + 186 * (laneIndex - 2)
        }
      } else if (this.playConfig.key == 5) {
        if (laneIndex >= 1 && laneIndex <= 5) {
          positionX = 343 + 148.5 * (laneIndex - 1)
        }
      } else if (this.playConfig.key == 6) {
        if (laneIndex <= 2) {
          positionX = 330 + 124 * laneIndex
        } else if (laneIndex >= 4) {
          positionX = 330 + 124 * (laneIndex - 1)
        }
      } else if (this.playConfig.key == 7) {
        positionX = 322 + 106 * laneIndex
      }

      this.keyFlashTweens.push(
        this.tweens.add({
          persist: true,
          targets: this.add
            .image(positionX, 720, "key-flash")
            .setOrigin(0.5, 1)
            .setDisplaySize((900 / this.playConfig.key) * 1.02, 720)
            .setDepth(-2),
          scaleX: { value: 0, duration: 80, ease: "Linear" },
          ease: "Quintic.Out",
          paused: false,
        }),
      )
      this.holdParticleEmitters.push(
        this.add.particles(positionX - widths[this.playConfig.key] / 2, 640, "particle-yellow", {
          x: 0,
          y: 0,
          angle: { min: 265, max: 275 },
          speed: 400,
          emitZone: {
            type: "random",
            source: new Phaser.Geom.Rectangle(0, 0, widths[this.playConfig.key], 1),
            quantity: 48,
            yoyo: false,
          },
          gravityY: -200,
          scale: { start: 0.2, end: 0 },
          lifespan: { min: 100, max: 350 },
          quantity: 1.5,
          blendMode: "ADD",
          emitting: false,
        }),
      )

      this.inputZones.push(
        this.add
          .zone(positionX, 720, widths[this.playConfig.key], 720)
          .setInteractive()
          .setOrigin(0.5, 1)
          .on("pointerover", () => {
            if (!this.isTouching[laneIndex]) {
              this.isTouching[laneIndex] = true
              this.judgeKeyDown(laneIndex)
            }
          })
          .on("pointerout", () => {
            this.isTouching[laneIndex] = false
          }),
      )
      this.keyLabels.push(
        this.add
          .text(positionX, 680, ["S", "D", "F", "SPACE", "J", "K", "L"][laneIndex], {
            fontFamily: "Bungee",
            fontSize: "50px",
            color: "#fafafa",
            align: "center",
          })
          .setOrigin(0.5)
          .setDepth(0)
          .setAlpha(0.6)
          .setScale(0.5),
      )
    }

    this.debugText = this.add.text(0, 450, "").setVisible(false)

    this.musicFrame = this.add.image(100, 80, "frame-vertical").setOrigin(0.5, 0).setScale(0, 0.67).setDepth(1)

    this.musicFrameLabelText = this.add
      .text(100, 110, "MUSIC INFO", {
        fontFamily: "Oswald",
        fontSize: "36px",
        color: "#dddddd",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4)
      .setScale(0.5)
      .setAlpha(0)

    this.titleText = this.add
      .text(30, 300, "", {
        fontFamily: "Noto Sans JP",
        fontSize: "26px",
        color: "#f0f0f0",
      })
      .setShadow(0, 0, "#080808", 4, false, true)
      .setOrigin(0, 0.5)
      .setDepth(10)
      .setScale(0.5)
      .setAlpha(0)

    this.artistText = this.add
      .text(30, 320, "", {
        fontFamily: "Noto Sans JP",
        fontSize: "20px",
        color: "#f0f0f0",
      })
      .setShadow(0, 0, "#080808", 4, false, true)
      .setOrigin(0, 0.5)
      .setDepth(10)
      .setScale(0.5)
      .setAlpha(0)

    this.jacketImage = this.add.image(100, 210, "jacket-no-image").setDepth(9).setDisplaySize(142, 142).setAlpha(0)

    if (this.music.jacket !== undefined) {
      this.jacketImage.setTexture(`jacket-${this.music.folder}/${this.music.jacket}`).setDisplaySize(142, 142)
    }

    this.keyIcon = this.add
      .image(100, 380, `key-icon-${this.playConfig.key}`)
      .setOrigin(0.5, 0.5)
      .setDepth(10)
      .setScale(0.7)
      .setAlpha(0)

    this.diffIcon = this.add
      .image(100, 410, `diff-icon-${this.playConfig.difficulty}`)
      .setOrigin(0.5, 0.5)
      .setDepth(10)
      .setScale(0.7)
      .setAlpha(0)

    // this.add.image(80,140,"jacket-test").setOrigin(0.5,0.5).setDepth(10).setDisplaySize(140,140)

    this.backButton = this.add
      .image(10, 10, "icon-back")
      .setOrigin(0, 0)
      .setDepth(10)
      .setScale(0.6)
      .setAlpha(0.5)
      .setInteractive({
        useHandCursor: true,
      })
      .once("pointerdown", () => {
        this.sound.play("cancel")
        this.cameras.main.fadeOut(500)
        this.hasRetired = true
      })
      .on("pointerover", () => {
        this.backButton.setAlpha(1)
      })
      .on("pointerout", () => {
        this.backButton.setAlpha(0.5)
      })

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (this.chartPlayer !== undefined && this.chartPlayer.hasFinished(this.beat) && this.chartPlayer !== undefined) {
        this.scene.start("result", {
          playResult: new PlayResult({
            music: this.music,
            playConfig: this.playConfig,
            judges: this.chartPlayer.judges,
            score: this.chartPlayer.score,
            maxCombo: Math.max(this.chartPlayer.maxCombo, this.chartPlayer.combo),
          }),
        })
      } else if (this.hasRetired) {
        this.scene.start("select", { playConfig: this.playConfig })
      }
    })

    this.normalTapSounds = []
    for (const judgeIndex of Array(5).keys()) {
      this.normalTapSounds.push(this.sound.add(`normal-tap-${judgeIndex + 1}`))
    }

    this.load.on("progress", (value: number) => {
      // console.log(value)
      this.debugText.setText(`${value}`)
    })
    this.load.on("complete", () => {
      if (!this.isLoading || this.hasLoaded) {
        return
      }
      this.hasLoaded = true
      this.loadEndTime = new Date()
      this.cameras.main.fadeIn(500)
      this.tweens.add({
        targets: [this.laneMainFrame, this.laneMainFrameLight, this.laneBackground, this.laneBackgroundLight],
        delay: 100,
        scaleX: {
          value: 0.67,
          duration: 600,
          ease: Phaser.Math.Easing.Cubic.Out,
        },
        onComplete: () => {
          this.tweens.add({
            targets: [this.judgeBar, this.judgeBarLight],
            alpha: {
              value: 1,
              duration: 400,
            },
          })
          this.tweens.add({
            targets: this.musicFrame,
            scaleX: {
              value: 0.67,
              duration: 400,
              ease: Phaser.Math.Easing.Cubic.Out,
            },
            onComplete: () => {
              this.tweens.add({
                targets: [
                  this.musicFrameLabelText,
                  this.jacketImage,
                  this.titleText,
                  this.artistText,
                  this.keyIcon,
                  this.diffIcon,
                ],
                alpha: {
                  value: 1,
                  duration: 400,
                },
              })
            },
          })
        },
      })
      this.tweens.add({
        targets: [this.backgroundMask],
        delay: 100,
        scaleX: {
          value: 1,
          duration: 600,
          ease: Phaser.Math.Easing.Cubic.Out,
        },
      })
    })
  }

  update(time: number, dt: number) {
    this.laneMainFrameLight.setAlpha(
      1 - 0.6 * ((this.beat % 1) % 1), // 0.95 + 0.6 * (-this.beat - Math.floor(1 - this.beat))
    )
    this.laneBackgroundLight.setAlpha(0.5 + 0.25 * 0.5 * (Math.sin(1 * Math.PI * this.beat) + 1))
    this.judgeBarLight.setAlpha(this.beat >= 0 ? 0.2 + 0.3 * (Math.cos(1 * Math.PI * this.beat) + 1) : 0)
    this.judgeBar.setTint(0xbbbbbb)

    if (this.hasLoaded && this.loadEndTime !== undefined && this.chartPlayer !== undefined) {
      this.screenMask.setVisible(false)
      if (this.latestJudgeSec !== this.chartPlayer.latestJudgeSec && this.chartPlayer.latestJudgeSec !== undefined) {
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
        // this.judgeText.setAlpha(1)
        this.normalTapSounds[this.chartPlayer.latestJudgeIndex].play()

        if (this.chartPlayer.latestJudgeIndex !== 0) {
          this.judgeFSText.setTexture(`judge-${this.chartPlayer.latestJudgeDiff > 0 ? "fast" : "slow"}`)
          this.judgeFSText.setVisible(true)
        } else {
          this.judgeFSText.setVisible(false)
        }
      }

      // update note
      this.playingSec = (new Date().getTime() - this.loadEndTime.getTime() - 3000) / 1000
      this.beat = this.chart.secondsToBeat(this.playingSec)
      this.chartPlayer.update(this, this.beat, this.playingSec, this.noteSpeed, this.keySoundPlayer)

      if (this.keys !== null) {
        for (const laneIndex of Array(7).keys()) {
          if (this.keys[laneIndex].isDown || this.isTouching[laneIndex]) {
            this.keyFlashTweens[laneIndex].restart()
          }
        }
      }
      // change back light
      if (this.chartPlayer.judges[3] == 0 && this.chartPlayer.judges[4] == 0) {
        if (this.chartPlayer.judges[1] == 0 && this.chartPlayer.judges[2] == 0) {
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
      if (this.keys !== null) {
        for (const laneIndex of Array(7).keys()) {
          if (Phaser.Input.Keyboard.JustDown(this.keys[laneIndex])) {
            this.judgeKeyDown(laneIndex)
          }
        }
      }

      // key hold
      for (const laneIndex of Array(7).keys()) {
        if (
          this.chartPlayer.isHolds[laneIndex] &&
          (this.keys === null || (this.keys !== null && !this.keys[laneIndex].isDown)) &&
          !this.isTouching[laneIndex]
        ) {
          this.chartPlayer.judgeKeyHold(this.playingSec, laneIndex)
        }
        this.holdParticleEmitters[laneIndex].emitting = this.chartPlayer.isHolds[laneIndex]
        if (this.chartPlayer.isHolds[laneIndex] && time % 130 <= 17) {
          this.addBomb(laneIndex)
        }
      }

      if (this.beat > -1) {
        this.tweens.add({
          targets: this.startText,
          y: 460,
          ease: "Linear",
          alpha: { value: 0, duration: 300, ease: "Linear" },
          duration: 300,
          paused: false,
        })
        this.tweens.add({
          targets: this.keyLabels,
          ease: "Linear",
          alpha: { value: 0, duration: 300, ease: "Linear" },
          duration: 300,
          paused: false,
        })
      }

      // debug
      this.debugText.setText(`${time}\n\nFPS:${(1000 / dt).toFixed(2)}`)
    } else {
      this.screenMask.setVisible(true)
    }
  }

  private judgeKeyDown(laneIndex: number) {
    if (this.chartPlayer !== undefined) {
      if (this.chartPlayer.judgeKeyDown(this, this.playingSec, laneIndex, this.keySoundPlayer)) {
        if (this.chartPlayer.latestJudgeIndex <= 2) {
          this.addBomb(laneIndex)
        }
      }
    }
  }

  private addBomb(laneIndex: number) {
    let positionX = -1200
    if (this.playConfig.key == 4) {
      if (laneIndex >= 1 && laneIndex <= 2) {
        positionX = 361 + 186 * (laneIndex - 1)
      } else if (laneIndex >= 4 && laneIndex <= 5) {
        positionX = 361 + 186 * (laneIndex - 2)
      }
    } else if (this.playConfig.key == 5) {
      if (laneIndex >= 1 && laneIndex <= 5) {
        positionX = 343 + 148.5 * (laneIndex - 1)
      }
    } else if (this.playConfig.key == 6) {
      if (laneIndex <= 2) {
        positionX = 330 + 124 * laneIndex
      } else if (laneIndex >= 4) {
        positionX = 330 + 124 * (laneIndex - 1)
      }
    } else if (this.playConfig.key == 7) {
      positionX = 322 + 106 * laneIndex
    }
    this.tweens.add({
      targets: this.add.image(positionX, 640, "bomb-2").setDisplaySize(256, 256).setAlpha(0.5),
      alpha: { value: 0, duration: 280, ease: "Linear" },
      scale: { value: 0.9, duration: 280, ease: "Linear" },
      angle: { value: 30, duration: 280, ease: "Linear" },
      paused: false,
    })
    this.tweens.add({
      targets: this.add.image(positionX, 640, "bomb-3").setDisplaySize(180, 180),
      alpha: { value: 0, duration: 140, ease: "Linear" },
      scale: { value: 0.4, duration: 110, ease: "Quintic.Out" },
      paused: false,
    })
    this.tweens.add({
      targets: this.add.image(positionX, 640, "bomb-1").setDisplaySize(196, 196),
      alpha: { value: 0, duration: 120, ease: "Linear" },
      scale: { value: 0.7, duration: 120, ease: "Linear" },
      paused: false,
    })
  }
}
