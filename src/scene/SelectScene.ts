import GUI from "lil-gui"
import { DebugGUI } from "../class/DebugGUI"
import { PlayConfig } from "../class/PlayConfig"

import { type Music, Beatmap } from "../class/Music"
import { MusicTile } from "../class/MusicTile"
import { MusicTileManager } from "../class/MusicTileManager"
import { type PlayResult } from "../class/PlayResult"
import { User } from "../class/User"

import { retryFetch } from "../lib/retryFetch"

type DIFFICULTY = 1 | 2 | 3 | 4
type KEY = 4 | 5 | 6 | 7

export class SelectScene extends Phaser.Scene {
  private debugGUI: DebugGUI

  private playButton: Phaser.GameObjects.Image
  private playButtonLight: Phaser.GameObjects.Image
  private diffButtons: Phaser.GameObjects.Image[]
  private keyButtons: Phaser.GameObjects.Image[]

  private scrollBar: Phaser.GameObjects.Image

  private loginIcon: Phaser.GameObjects.Image
  private loginLabel: Phaser.GameObjects.Text

  private selectedDiffIcon: Phaser.GameObjects.Image
  private selectedKeyIcon: Phaser.GameObjects.Image
  private selectedMusicTitleText: Phaser.GameObjects.Text
  private beatmapLevelText: Phaser.GameObjects.Text
  private nonPlayableText: Phaser.GameObjects.Text

  private bestScoreText: Phaser.GameObjects.Text

  private jacketImage: Phaser.GameObjects.Image

  private difficulty: DIFFICULTY = 1
  private key: KEY = 4
  private isPlayable: boolean = false
  private scrollIndex: number

  private musicList: Music[]
  private musicTileManager: MusicTileManager

  private userScreenNameText: Phaser.GameObjects.Text
  private userStatusText: Phaser.GameObjects.Text

  private backgroundCamera: Phaser.Cameras.Scene2D.Camera

  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter

  private playConfig: PlayConfig

  private user: User
  constructor() {
    super("select")

    this.scrollIndex = 0
  }

  init(data: any) {
    this.debugGUI = new DebugGUI(this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, () => {
      this.debugGUI.destroy()
    })

    this.musicList = this.cache.json.get("music-list")

    this.musicTileManager = new MusicTileManager(this, this.scrollIndex)

    this.playConfig =
      data.playConfig ||
      JSON.parse(localStorage.getItem("play_config")) ||
      new PlayConfig({
        noteSpeed: 3.0,
        noteType: "circle",
        key: 4,
        difficulty: 1,
      })
    this.game.sound.stopAll()

    this.user = new User({
      id: 0,
      screen_name: "Guest",
      rank: 0,
      performance_point: 0,
    })

    const checkAuthorization = async () => {
      const token_type = localStorage.getItem("token_type")
      const access_token = localStorage.getItem("access_token")

      if (token_type && access_token) {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `${token_type} ${access_token}`,
        }
        const userResponse = await retryFetch(new URL("/users/me", process.env.SERVER_URL).toString(), {
          headers,
        })
        if (userResponse.ok) {
          const user = await userResponse.json()
          this.user = new User({
            id: user.id,
            screen_name: user.screen_name,
            rank: user.rank,
            performance_point: user.performance_point,
          })

          localStorage.setItem("user", JSON.stringify(user))
          this.loginIcon.removeListener("pointerdown").on("pointerdown", () => {
            if (window.open("https://beats-ir.tus-ricora.com/", "_blank") == null) {
              location.href = "https://beats-ir.tus-ricora.com/"
            }
          })
          this.loginLabel.setText("IRサイトを開く")
          this.userScreenNameText.setText(`${this.user.screen_name}`)
          this.userStatusText.setText(`${this.user.ordinalRank} / ${this.user.performance_point}pts.`)
        }
      }
    }
    checkAuthorization()
  }

  create() {
    const { width, height } = this.game.canvas

    this.backgroundCamera = this.cameras.add(0, 0, 1280, 720)
    this.backgroundCamera.setScroll(1280, 720)
    this.cameras.add(0, 0, 1280, 720, true)
    this.add.shader("background", width / 2 + 1280, height / 2 + 720, 1280, 720).setDepth(-5)

    // @ts-expect-error
    this.plugins.get("rexKawaseBlurPipeline").add(this.backgroundCamera, {
      blur: 8,
      quality: 8,
    })

    const particleYellow = this.add.particles("particle-yellow").setDepth(20)

    this.particleEmitter = particleYellow.createEmitter({
      x: -1280,
      y: 0,
      angle: { min: 0, max: 360 },
      speed: 60,
      emitZone: {
        type: "random",
        source: new Phaser.Geom.Circle(0, 0, 6),
        quantity: 12,
        yoyo: false,
      },
      scale: { start: 0.08, end: 0 },
      lifespan: { min: 300, max: 1000 },
      quantity: 0.6,
      blendMode: "ADD",
      on: true,
    })

    this.add.image(52, 15, "frame-title").setScale(0.7, 0.45).setOrigin(0, 0)

    this.add.image(52, 635, "frame-title").setScale(0.7, 0.45).setOrigin(0, 0)

    this.add.image(80, 15 + 18, "icon-adjustments").setOrigin(0, 0.5)
    this.add.image(80, 635 + 18, "icon-adjustments").setOrigin(0, 0.5)

    this.add
      .text(120, 15 + 18, "難易度を変更", {
        fontFamily: "Noto Sans JP",
        fontSize: "34px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)

    this.add
      .text(120, 635 + 18, "使用するキーの数を変更", {
        fontFamily: "Noto Sans JP",
        fontSize: "34px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)

    this.add
      .rectangle(1030, 415 + 15, 120, 40, 0x000000, 40)
      .setOrigin(0, 1)
      .setDepth(3)

    this.add
      .text(1045, 415 + 15, "LEVEL", {
        fontFamily: "Oswald",
        fontSize: "50px",
        color: "#bbbbbb",
      })
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(4)

    this.beatmapLevelText = this.add
      .text(1139, 418 + 15, "", {
        fontFamily: "Oswald",
        fontSize: "75px",
        color: "#fafafa",
      })
      .setOrigin(1, 1)
      .setScale(0.5)
      .setDepth(4)

    this.nonPlayableText = this.add
      .text(1030, 500 + 30, "この譜面は現在プレーできません。", {
        fontFamily: "Noto Sans JP",
        fontSize: "40px",
        color: "#f0f0f0",
      })
      .setStroke("#000000", 8)
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(3)

    this.add
      .text(895, 460 + 18, "BEST SCORE", {
        fontFamily: "Oswald",
        fontSize: "45px",
        color: "#bbbbbb",
      })
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(4)

    this.bestScoreText = this.add
      .text(1165, 463 + 20, "", {
        fontFamily: "Oswald",
        fontSize: "70px",
        color: "#fafafa",
      })
      .setOrigin(1, 1)
      .setScale(0.5)
      .setDepth(4)

    this.diffButtons = []
    for (const diffIndex of Array(4).keys()) {
      this.diffButtons.push(
        this.add
          .image(80 + 180 * diffIndex, 50, `diff-icon-${diffIndex + 1}`)
          .setOrigin(0, 0)
          .setAlpha(diffIndex == this.difficulty - 1 ? 1 : 0.3)
          .setDepth(10),
      )
    }
    for (const diffIndex of Array(4).keys()) {
      this.diffButtons[diffIndex]
        .setInteractive({
          useHandCursor: true,
        })
        .on("pointerdown", () => {
          this.sound.play("cursor")
          this.difficulty = (diffIndex + 1) as DIFFICULTY
          this.selectedDiffIcon.setTexture(`diff-icon-${diffIndex + 1}`)
          for (const diffIndex of Array(4).keys()) {
            this.diffButtons[diffIndex].setAlpha(diffIndex == this.difficulty - 1 ? 1 : 0.3)
          }
        })
    }

    this.keyButtons = []
    for (const keyIndex of Array(4).keys()) {
      this.keyButtons.push(
        this.add
          .image(80 + 180 * keyIndex, 670, `key-icon-${keyIndex + 4}`)
          .setOrigin(0, 0)
          .setAlpha(keyIndex == this.key - 4 ? 1 : 0.3)
          .setDepth(10),
      )
    }
    for (const keyIndex of Array(4).keys()) {
      this.keyButtons[keyIndex]
        .setInteractive({
          useHandCursor: true,
        })
        .on("pointerdown", () => {
          this.sound.play("cursor")
          this.key = (keyIndex + 4) as KEY
          this.selectedKeyIcon.setTexture(`key-icon-${keyIndex + 4}`)
          for (const keyIndex of Array(4).keys()) {
            this.keyButtons[keyIndex].setAlpha(keyIndex == this.key - 4 ? 1 : 0.3)
          }
        })
    }

    this.add.image(30, 360, "scroll-bar-frame").setOrigin(0.5, 0.5)

    this.scrollBar = this.add.image(30, 360 - 235, "scroll-bar").setOrigin(0.5, 0.5)

    this.add.image(830, 360, "music-detail-frame").setOrigin(0, 0.5)

    this.add.image(850, 160, "icon-music").setOrigin(0, 0.5).setScale(0.4).setDepth(4)

    this.selectedMusicTitleText = this.add
      .text(890, 160, "", {
        fontFamily: "Noto Sans JP",
        fontSize: "45px",
        color: "#fafafa",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setDepth(4)

    this.add.rectangle(830 + 200, 280 + 30, 240, 240, 0x0a0a0a, 140).setDepth(1)

    this.jacketImage = this.add
      .image(830 + 200, 280 + 30, "")
      .setDisplaySize(240, 240)
      .setDepth(2)

    this.selectedKeyIcon = this.add
      .image(830 + 83, 140 + 40, `key-icon-${this.key}`)
      .setOrigin(0, 0)
      .setDepth(3)
      .setScale(0.5)

    this.selectedDiffIcon = this.add
      .image(830 + 83 + 87, 140 + 40, `diff-icon-${this.difficulty}`)
      .setOrigin(0, 0)
      .setDepth(3)
      .setScale(0.5)

    this.playButton = this.add
      .image(830 + 200, 500 + 30, "play-button-enable")
      .setOrigin(0.5, 0.5)
      .setDepth(1)

    this.playButtonLight = this.add
      .image(830 + 200, 500 + 30, "play-button-light")
      .setOrigin(0.5, 0.5)
      .setDepth(0)

    this.add.image(830, 650, "config-frame").setOrigin(0, 0.5)
    this.add
      .text(830 + 400 * 0.2, 680, "プレー設定", {
        fontFamily: "Noto Sans JP",
        fontSize: "26px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
    this.add
      .image(830 + 400 * 0.2, 640, "icon-config")
      .setOrigin(0.5, 0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.sound.play("select")
        this.scene.run("config", { playConfig: this.playConfig })
      })

    this.loginLabel = this.add
      .text(830 + 400 * 0.5, 680, "IRにログイン", {
        fontFamily: "Noto Sans JP",
        fontSize: "26px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
    this.loginIcon = this.add
      .image(830 + 400 * 0.5, 640, "icon-ir")
      .setOrigin(0.5, 0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.sound.play("select")
        this.scene.run("login")
      })
    this.add
      .text(830 + 400 * 0.8, 680, "クレジット", {
        fontFamily: "Noto Sans JP",
        fontSize: "26px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
    this.add
      .image(830 + 400 * 0.8, 640, "icon-credit")
      .setOrigin(0.5, 0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.sound.play("select")
        this.scene.run("credit")
      })

    const helpButton = this.add
      .image(5, 5, "icon-help")
      .setOrigin(0, 0)
      .setAlpha(0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        if (window.open("https://github.com/RICORA/ricora-beats/wiki", "_blank") == null) {
          location.href = "https://github.com/RICORA/ricora-beats/wiki"
        }
      })
      .on("pointerover", () => {
        helpButton.setAlpha(1)
      })
      .on("pointerout", () => {
        helpButton.setAlpha(0.5)
      })

    const fullScreenButton = this.add
      .image(1275, 5, "icon-maximize")
      .setOrigin(1, 0)
      .setAlpha(0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        if (this.scale.isFullscreen) {
          fullScreenButton.setTexture("icon-maximize")

          this.scale.stopFullscreen()
        } else {
          fullScreenButton.setTexture("icon-minimize")
          this.scale.startFullscreen()
        }
      })
      .on("pointerover", () => {
        fullScreenButton.setAlpha(1)
      })
      .on("pointerout", () => {
        fullScreenButton.setAlpha(0.5)
      })

    const ascScrollZone = this.add
      .zone(100, 100, 570, 200)
      .setOrigin(0, 0)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.sound.play("cursor")
        this.stopPreviewSound()
        this.musicTileManager.scroll(false)
        this.tweens.add({
          targets: this.scrollBar,
          y: {
            value: `-=${(235 * 2) / Math.max(this.musicTileManager.musicList.length - 1, 1)}`,
            duration: 120,
            ease: "Quintic.Out",
          },
          onUpdate: () => {
            if (this.scrollBar.y < 360 - 235) {
              this.scrollBar.setY(360 + 235)
            }
          },
          onComplete: () => {
            this.scrollBar.setY(
              360 +
                235 *
                  ((2 * this.musicTileManager.scrollIndex) / Math.max(this.musicTileManager.musicList.length - 1, 1) -
                    1),
            )
          },
        })
        this.playPreviewSound()
      })
    const descScrollZone = this.add
      .zone(100, 620, 570, 200)
      .setOrigin(0, 1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.sound.play("cursor")
        this.stopPreviewSound()
        this.musicTileManager.scroll(true)
        this.tweens.add({
          targets: this.scrollBar,
          y: {
            value: `+=${(235 * 2) / Math.max(this.musicTileManager.musicList.length - 1, 1)}`,
            duration: 120,
            ease: "Quintic.Out",
          },
          onUpdate: () => {
            if (360 + 235 < this.scrollBar.y) {
              this.scrollBar.setY(360 - 235)
            }
          },
          onComplete: () => {
            this.scrollBar.setY(
              360 +
                235 *
                  ((2 * this.musicTileManager.scrollIndex) / Math.max(this.musicTileManager.musicList.length - 1, 1) -
                    1),
            )
          },
        })
        this.playPreviewSound()
      })

    this.add.image(1030, 70, "config-frame")

    this.add.image(880, 70, "icon-user")

    this.userScreenNameText = this.add
      .text(930, 55, "Guest", {
        fontFamily: "Noto Sans JP",
        fontSize: "48px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setDepth(2)

    this.userStatusText = this.add
      .text(930, 90, "", {
        fontFamily: "Noto Sans JP",
        fontSize: "36px",
        color: "#bbbbbb",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setDepth(2)

    this.playButton
      .setInteractive({
        useHandCursor: true,
      })
      .once("pointerdown", () => {
        if (this.isPlayable) {
          this.sound.play("decide")
          this.stopPreviewSound()
          this.cameras.main.fadeOut(500)
          this.scrollIndex = this.musicTileManager.scrollIndex
        }
      })
      .on("pointerover", () => {
        if (this.isPlayable) {
          this.playButton.setAlpha(1)
        }
      })
      .on("pointerout", () => {
        if (this.isPlayable) {
          this.playButton.setAlpha(0.8)
        }
      })
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.playConfig.key = this.key
      this.playConfig.difficulty = this.difficulty
      this.scene.start("play", {
        music: this.musicTileManager.getMusic(),
        beatmap: this.musicTileManager.getBeatmap(this.key, this.difficulty),
        playConfig: this.playConfig,
      })
    })
    this.cameras.main.fadeIn(500)
    this.playPreviewSound()
  }

  update(time: number, dt: number) {
    this.musicTileManager.update(time)

    this.particleEmitter.setPosition(this.input.x, this.input.y)

    this.selectedMusicTitleText.setText(this.musicTileManager.getMusic().title)

    this.isPlayable = this.musicTileManager.isPlayable(this.key, this.difficulty)
    if (this.isPlayable) {
      if (this.playButton.alpha == 0.3) {
        this.playButton.setAlpha(0.8)
      }
      this.playButton.setTexture("play-button-enable")
      this.nonPlayableText.setVisible(false)
      this.beatmapLevelText.setText(this.musicTileManager.getBeatmap(this.key, this.difficulty).playlevel)
      this.playButtonLight.setAlpha(0.2 + 0.8 * Math.abs(Math.sin((time * 2 * Math.PI * 0.25) / 1000)))
    } else {
      this.playButton.setTexture("play-button-disable").setAlpha(0.3)
      this.nonPlayableText.setVisible(true)
      this.beatmapLevelText.setText("-")
      this.playButtonLight.setAlpha(0)
    }

    if (this.textures.exists(this.musicTileManager.getJacketImageKey())) {
      this.jacketImage.setTexture(this.musicTileManager.getJacketImageKey()).setDisplaySize(240, 240)
    } else {
      this.jacketImage.setTexture("jacket-no-image").setDisplaySize(240, 240)
    }
    const bestPlayResult: PlayResult | null = JSON.parse(
      localStorage.getItem(`play_result_${this.musicTileManager.getMusic().folder}_${this.key}_${this.difficulty}`),
    )
    if (bestPlayResult !== null) {
      this.bestScoreText.setText(`${bestPlayResult.score.toFixed(2)} %`)
    } else {
      this.bestScoreText.setText("-    %")
    }
  }

  private playPreviewSound() {
    const music = this.musicList[this.musicTileManager.scrollIndex]
    const soundKey = `preview-${music.folder}/${music.preview}`
    if (this.cache.audio.exists(soundKey)) {
      this.sound.play(soundKey, { loop: true })
    }
  }

  private stopPreviewSound() {
    const music = this.musicList[this.musicTileManager.scrollIndex]
    const soundKey = `preview-${music.folder}/${music.preview}`
    if (this.cache.audio.exists(soundKey)) {
      this.sound.stopByKey(soundKey)
    }
  }
}
