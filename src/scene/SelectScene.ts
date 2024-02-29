import { DebugGUI } from "../class/DebugGUI"
import { PlayConfig } from "../class/PlayConfig"

import { type Music } from "../class/Music"
import { MusicTileManager } from "../class/MusicTileManager"
import { type PlayResult } from "../class/PlayResult"
import { User } from "../class/User"

import { retryFetch } from "../lib/retryFetch"

import { isExhibitionMode } from "../lib/exhibitionMode"

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

  private rankingIndexTexts: Phaser.GameObjects.Text[]
  private rankingScoreTexts: Phaser.GameObjects.Text[]
  private rankingScreenNameTexts: Phaser.GameObjects.Text[]

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

  init(data: any): void {
    this.debugGUI = new DebugGUI(this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, () => {
      this.debugGUI.destroy()
    })

    this.musicList = this.cache.json.get("music-list")

    this.musicTileManager = new MusicTileManager(this, this.scrollIndex)

    const localStoragePlayConfig = localStorage.getItem("play_config")
    let localStoragePlayConfigJSON = null
    if (localStoragePlayConfig !== null) {
      localStoragePlayConfigJSON = JSON.parse(localStoragePlayConfig)
    }
    this.playConfig =
      data.playConfig ??
      localStoragePlayConfigJSON ??
      new PlayConfig({
        noteSpeed: 3.0,
        noteType: "circle",
        isMirror: false,
        key: 4,
        difficulty: 1,
      })
    this.game.sound.stopAll()

    this.user = new User({
      id: 0,
      screenName: "Guest",
      rank: 0,
      performancePoint: 0,
    })

    const checkAuthorization = async (): Promise<void> => {
      const tokenType = localStorage.getItem("token_type")
      const accessToken = localStorage.getItem("access_token")

      if (tokenType !== null && accessToken !== null) {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${accessToken}`,
        }
        const userResponse = await retryFetch(new URL("/users/me", process.env.SERVER_URL).toString(), {
          headers,
        })
        if (userResponse.ok) {
          const user = await userResponse.json()
          this.user = new User({
            id: user.id,
            screenName: user.screen_name,
            rank: user.rank,
            performancePoint: user.performance_point,
          })

          localStorage.setItem("user", JSON.stringify(user))
          this.loginIcon.removeListener("pointerdown").on("pointerdown", () => {
            if (window.open("https://beats-ir.tus-ricora.com/", "_blank") == null) {
              location.href = "https://beats-ir.tus-ricora.com/"
            }
          })
          this.loginLabel.setText("IRサイトを開く")
          this.userScreenNameText.setText(`${this.user.screenName}`)
          this.userStatusText.setText(`${this.user.ordinalRank} / ${this.user.performancePoint}pts.`)
        }
      }
    }
    void checkAuthorization()
  }

  create(): void {
    const { width, height } = this.game.canvas

    this.backgroundCamera = this.cameras.add(0, 0, 1280, 720)
    this.backgroundCamera.setScroll(1280, 720)
    this.cameras.add(0, 0, 1280, 720, true)
    this.add.shader("background", width / 2 + 1280, height / 2 + 720, 1280, 720).setDepth(-5)

    // @ts-expect-error: 型が不明なため
    this.plugins.get("rexKawaseBlurPipeline").add(this.backgroundCamera, {
      blur: 8,
      quality: 8,
    })

    this.particleEmitter = this.add
      .particles(0, 0, "particle-yellow", {
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
        emitting: true,
      })
      .setDepth(20)

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
      .rectangle(1030 - 50, 415 + 15, 120, 40, 0x000000, 40)
      .setOrigin(0, 1)
      .setDepth(3)

    this.add
      .text(1045 - 50, 415 + 15, "LEVEL", {
        fontFamily: "Oswald",
        fontSize: "50px",
        color: "#bbbbbb",
      })
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(4)

    this.beatmapLevelText = this.add
      .text(1139 - 50, 418 + 15, "", {
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
          .setAlpha(diffIndex === this.difficulty - 1 ? 1 : 0.3)
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
            this.diffButtons[diffIndex].setAlpha(diffIndex === this.difficulty - 1 ? 1 : 0.3)
          }
          void this.getRanking()
        })
    }

    this.keyButtons = []
    for (const keyIndex of Array(4).keys()) {
      this.keyButtons.push(
        this.add
          .image(80 + 180 * keyIndex, 670, `key-icon-${keyIndex + 4}`)
          .setOrigin(0, 0)
          .setAlpha(keyIndex === this.key - 4 ? 1 : 0.3)
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
            this.keyButtons[keyIndex].setAlpha(keyIndex === this.key - 4 ? 1 : 0.3)
          }
          void this.getRanking()
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

    this.add.rectangle(830 + 200 - 50, 280 + 30, 240, 240, 0x0a0a0a, 140).setDepth(1)

    this.jacketImage = this.add
      .image(830 + 200 - 50, 280 + 30, "")
      .setDisplaySize(240, 240)
      .setDepth(2)
    this.jacketImage.postFX.addShine(0.7, 0.1, 5)

    this.selectedKeyIcon = this.add
      .image(830 + 83 - 50, 140 + 40, `key-icon-${this.key}`)
      .setOrigin(0, 0)
      .setDepth(3)
      .setScale(0.5)

    this.selectedDiffIcon = this.add
      .image(830 + 83 + 87 - 50, 140 + 40, `diff-icon-${this.difficulty}`)
      .setOrigin(0, 0)
      .setDepth(3)
      .setScale(0.5)

    this.rankingIndexTexts = []
    this.rankingScoreTexts = []
    this.rankingScreenNameTexts = []
    const rankingFontSize = "15px"

    this.add
      .text(1165, 188, "TOP RANKING", {
        fontFamily: "Oswald",
        fontSize: rankingFontSize,
        color: "#bbbbbb",
        align: "right",
      })
      .setOrigin(0.5, 0)

    for (const rankingIndex of Array(6).keys()) {
      const y = 213 + 36 * rankingIndex
      this.rankingIndexTexts.push(
        this.add
          .text(1110, y, `${rankingIndex + 1}`, {
            fontFamily: "Oswald",
            fontSize: rankingFontSize,
            color: "#888888",
            align: "left",
          })
          .setOrigin(0, 0),
      )
      this.rankingScoreTexts.push(
        this.add
          .text(1220, y + 16, "", {
            fontFamily: "Oswald",
            fontSize: rankingFontSize,
            color: "#dddddd",
            align: "right",
          })
          .setOrigin(1, 0),
      )

      this.rankingScreenNameTexts.push(
        this.add
          .text(1127, y, "", {
            fontFamily: "Noto Sans JP",
            fontSize: rankingFontSize,
            color: "#fafafa",
            align: "right",
            wordWrap: { width: 80, useAdvancedWrap: true },
            lineSpacing: 1440,
          })
          .setOrigin(0, 0),
      )
    }

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

    if (isExhibitionMode()) {
      this.loginIcon.setAlpha(0.5)
      this.loginLabel.setAlpha(0.5)
    } else {
      this.loginIcon
        .setInteractive({
          useHandCursor: true,
        })
        .on("pointerdown", () => {
          this.sound.play("select")
          this.scene.run("login")
        })
    }

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
      .setVisible(!isExhibitionMode())
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
      .setVisible(!isExhibitionMode())
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

    this.add
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
            void this.getRanking()
          },
        })
        this.playPreviewSound()
      })
    this.add
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
            void this.getRanking()
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
    void this.getRanking()
  }

  update(time: number, dt: number): void {
    this.musicTileManager.update(time)

    this.particleEmitter.particleX = this.input.x
    this.particleEmitter.particleY = this.input.y

    this.selectedMusicTitleText.setText(this.musicTileManager.getMusic().title)

    this.isPlayable = this.musicTileManager.isPlayable(this.key, this.difficulty)
    if (this.isPlayable) {
      if (this.playButton.alpha === 0.3) {
        this.playButton.setAlpha(0.8)
      }
      this.playButton.setTexture("play-button-enable")
      this.nonPlayableText.setVisible(false)
      this.beatmapLevelText.setText(`${this.musicTileManager.getBeatmap(this.key, this.difficulty).playlevel}`)
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

    this.bestScoreText.setText("-    %")
    const localStoragePlayResultKey = `play_result_${this.musicTileManager.getMusic().folder}_${this.key}_${
      this.difficulty
    }`
    const localStoragePlayResult = localStorage.getItem(localStoragePlayResultKey)
    if (localStoragePlayResult !== null) {
      const bestPlayResult: PlayResult = JSON.parse(localStoragePlayResult)
      this.bestScoreText.setText(`${bestPlayResult.score.toFixed(2)} %`)
    }
  }

  private playPreviewSound(): void {
    const music = this.musicList[this.musicTileManager.scrollIndex]
    const soundKey = `preview-${music.folder}/${music.preview}`
    if (this.cache.audio.exists(soundKey)) {
      this.sound.play(soundKey, { loop: true })
    }
  }

  private stopPreviewSound(): void {
    const music = this.musicList[this.musicTileManager.scrollIndex]
    const soundKey = `preview-${music.folder}/${music.preview}`
    if (this.cache.audio.exists(soundKey)) {
      this.sound.stopByKey(soundKey)
    }
  }

  private async getRanking(): Promise<void> {
    for (const rankingIndex of Array(6).keys()) {
      this.rankingScoreTexts[rankingIndex].setText("")
      this.rankingScreenNameTexts[rankingIndex].setText("-------------")
    }
    const music = this.musicTileManager.getMusic()
    const folder = music.folder
    const filename = music[`beatmap_${this.key}k_${this.difficulty}`]?.filename
    if (filename === undefined) {
      // ランキングなし
      return
    }

    const rankingResponse = await retryFetch(
      new URL(
        `/scores/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}/`,
        process.env.SERVER_URL,
      ).toString(),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    if (!rankingResponse.ok) {
      // 取得失敗
      return
    }
    interface rankingScore {
      score: number
      player_id: number
    }
    const ranking: rankingScore[] = await rankingResponse.json()
    ranking.sort((a: any, b: any) => {
      return a.score < b.score ? 1 : -1
    })

    const usersResponse = await retryFetch(new URL("/users/", process.env.SERVER_URL).toString(), {
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!usersResponse.ok) {
      return
    }
    const users = await usersResponse.json()
    const userIdToScreenName: Record<number, string> = {}
    for (const user of users) {
      userIdToScreenName[user.id] = user.screen_name
    }

    for (const [rankingIndex, score] of ranking.slice(0, 6).entries()) {
      this.rankingScoreTexts[rankingIndex].setText(`${score.score.toFixed(2)}%`).setAlpha(0)
      this.rankingScreenNameTexts[rankingIndex].setText(`${userIdToScreenName[score.player_id]}`).setAlpha(0)
      this.tweens.add({
        targets: [this.rankingScoreTexts[rankingIndex], this.rankingScreenNameTexts[rankingIndex]],
        delay: 50 + rankingIndex * 50,
        alpha: {
          value: 1,
          duration: 100,
        },
      })
    }
  }
}
