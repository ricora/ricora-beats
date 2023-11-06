import { DebugGUI } from "../class/DebugGUI"
import { PlayResult } from "../class/PlayResult"
import { Music } from "../class/Music"

import { retryFetch } from "../lib/retryFetch"

export class ResultScene extends Phaser.Scene {
  private debugGUI: DebugGUI

  private playResult: PlayResult
  private oldPlayResult: PlayResult

  private titleText: Phaser.GameObjects.Text
  private artistText: Phaser.GameObjects.Text
  private noterText: Phaser.GameObjects.Text
  private scoreText: Phaser.GameObjects.Text
  private scoreLabelText: Phaser.GameObjects.Text
  private oldScoreLabelText: Phaser.GameObjects.Text
  private oldScoreText: Phaser.GameObjects.Text
  private oldScoreDiffText: Phaser.GameObjects.Text
  private comboText: Phaser.GameObjects.Text
  private comboLabelText: Phaser.GameObjects.Text
  private judgeTexts: Phaser.GameObjects.Text[]
  private judgeLabelTexts: Phaser.GameObjects.Text[]
  private rankText: Phaser.GameObjects.Text
  private rankLabelText: Phaser.GameObjects.Text

  private ranking: any[]
  private rankingIndexTexts: Phaser.GameObjects.Text[]
  private rankingScoreTexts: Phaser.GameObjects.Text[]
  private rankingScreenNameTexts: Phaser.GameObjects.Text[]

  private titleFrame: Phaser.GameObjects.Image
  private detailFrame: Phaser.GameObjects.Image
  private subDetailFrame: Phaser.GameObjects.Image

  private rankingFrame: Phaser.GameObjects.Rectangle

  private musicIcon: Phaser.GameObjects.Image
  private artistIcon: Phaser.GameObjects.Image
  private noterIcon: Phaser.GameObjects.Image

  private jacketImage: Phaser.GameObjects.Image

  private keyIcon: Phaser.GameObjects.Image
  private diffIcon: Phaser.GameObjects.Image

  private backButton: Phaser.GameObjects.Image
  private tweetButton: Phaser.GameObjects.Image
  private snapButton: Phaser.GameObjects.Image

  private line1: Phaser.GameObjects.Rectangle
  private line2: Phaser.GameObjects.Rectangle

  private backgroundCamera: Phaser.Cameras.Scene2D.Camera

  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter

  constructor() {
    super("result")
  }

  init(data: any) {
    this.debugGUI = new DebugGUI(this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, () => {
      this.debugGUI.destroy()
    })

    this.playResult =
      data.playResult ||
      new PlayResult({
        music: {
          title: "test",
          artist: "作曲者",
          noter: "譜面作者",
          folder: "test",
          beatmap_7k_1: {
            filename: "test7.bme",
            playlevel: 1,
          },
        },
        playConfig: {
          noteSpeed: 6.5,
          noteType: "rectangle",
          key: 7,
          difficulty: 3,
        },
        judges: [1000, 200, 30, 4, 5],
        score: 95.21,
        maxCombo: 1234,
      })
    this.oldPlayResult = JSON.parse(
      localStorage.getItem(
        `play_result_${this.playResult.music.folder}_${this.playResult.playConfig.key}_${this.playResult.playConfig.difficulty}`,
      ) as string,
    )
    if (this.oldPlayResult === null) {
      this.oldPlayResult = { ...this.playResult }
      this.oldPlayResult.score = 0
    }
    if (this.oldPlayResult.score <= this.playResult.score) {
      localStorage.setItem(
        `play_result_${this.playResult.music.folder}_${this.playResult.playConfig.key}_${this.playResult.playConfig.difficulty}`,
        JSON.stringify(this.playResult),
      )
    }
    const getRanking = async (userId?: number) => {
      const folder = this.playResult.music.folder
      const filename = this.playResult.music[
        `beatmap_${this.playResult.playConfig.key}k_${this.playResult.playConfig.difficulty}`
      ]?.filename as string
      const rankingResponse = await retryFetch(
        new URL(
          `/scores/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}/`,
          process.env.SERVER_URL as string,
        ).toString(),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      if (!rankingResponse.ok) {
        return
      }
      const ranking: any[] = await rankingResponse.json()
      ranking.sort((a: any, b: any) => {
        return a.score < b.score ? 1 : -1
      })
      if (userId) {
        let rank: number | undefined
        for (const [rankingIndex, score] of ranking.entries()) {
          if (score.player_id === userId) {
            rank = rankingIndex + 1
            break
          }
        }
        this.rankText.setText(`${rank} / ${ranking.length}`)
      } else {
        this.rankText.setText("")
      }

      this.ranking = ranking

      const usersResponse = await retryFetch(new URL("/users/", process.env.SERVER_URL as string).toString(), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!usersResponse.ok) {
        return
      }
      const users = await usersResponse.json()
      let userIdToScreenName: { [key: number]: string } = {}
      for (const user of users) {
        userIdToScreenName[user.id] = user.screen_name
      }

      for (const [rankingIndex, score] of ranking.slice(0, 30).entries()) {
        this.rankingIndexTexts[rankingIndex].setText(`${rankingIndex + 1}`)
        this.rankingScoreTexts[rankingIndex].setText(`${score.score.toFixed(2)}%`)
        this.rankingScreenNameTexts[rankingIndex].setText(`${userIdToScreenName[score.player_id]}`)
      }
    }
    const sendScore = async () => {
      const token_type = localStorage.getItem("token_type")
      const access_token = localStorage.getItem("access_token")

      if (!token_type || !access_token) {
        await getRanking()
        return
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `${token_type} ${access_token}`,
      }

      const userResponse = await retryFetch(new URL("/users/me", process.env.SERVER_URL as string).toString(), {
        headers: headers,
      })
      if (!userResponse.ok) {
        await getRanking()
        return
      }
      const user = await userResponse.json()
      const folder = this.playResult.music.folder
      const filename = this.playResult.music[
        `beatmap_${this.playResult.playConfig.key}k_${this.playResult.playConfig.difficulty}`
      ]?.filename as string
      const sendScoreResponse = await retryFetch(new URL("/scores/", process.env.SERVER_URL as string).toString(), {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          folder: folder,
          filename: filename,
          level:
            this.playResult.music[`beatmap_${this.playResult.playConfig.key}k_${this.playResult.playConfig.difficulty}`]
              ?.playlevel,
          score: this.playResult.score,
          combo: this.playResult.maxCombo,
          judge_0: this.playResult.judges[0],
          judge_1: this.playResult.judges[1],
          judge_2: this.playResult.judges[2],
          judge_3: this.playResult.judges[3],
          judge_4: this.playResult.judges[4],
        }),
      })
      if (!sendScoreResponse.ok) {
        await getRanking()
        return
      }
      await getRanking(user.id)
    }
    sendScore()
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

    this.titleFrame = this.add.image(100, 125, "frame-title").setScale(0.67, 0).setOrigin(0, 0.5).setDepth(-2)

    this.detailFrame = this.add.image(100, 500, "frame-detail").setScale(0.67, 0).setOrigin(0, 0.5).setDepth(-2)

    this.subDetailFrame = this.add.image(530, 500, "frame-vertical").setScale(0.67, 0).setDepth(-2).setOrigin(0, 0.5)

    this.titleText = this.add
      .text(190, 110, this.playResult.music.title, {
        fontFamily: "Noto Sans JP",
        fontSize: "60px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setAlpha(0)

    this.artistText = this.add
      .text(170, 150, this.playResult.music.artist, {
        fontFamily: "Noto Sans JP",
        fontSize: "30px",
        color: "#bbbbbb",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setAlpha(0)

    this.noterText = this.add
      .text(420, 150, this.playResult.music.noter, {
        fontFamily: "Noto Sans JP",
        fontSize: "30px",
        color: "#bbbbbb",
      })
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setAlpha(0)

    this.jacketImage = this.add
      .image(750, 125, `jacket-${this.playResult.music.folder}/${this.playResult.music.jacket}`)
      .setDisplaySize(90, 90)
      .setOrigin(0.5)
      .setAlpha(0)

    this.keyIcon = this.add
      .image(130, 65, `key-icon-${this.playResult.playConfig.key}`)
      .setOrigin(0, 0.5)
      .setDepth(10)
      .setAlpha(0)

    this.diffIcon = this.add
      .image(310, 65, `diff-icon-${this.playResult.playConfig.difficulty}`)
      .setOrigin(0, 0.5)
      .setDepth(10)
      .setAlpha(0)

    this.musicIcon = this.add.image(130, 110, "icon-music").setScale(0.6).setOrigin(0, 0.5).setAlpha(0)

    this.artistIcon = this.add.image(140, 150, "icon-artist").setScale(0.7).setOrigin(0, 0.5).setAlpha(0)

    this.noterIcon = this.add.image(390, 150, "icon-noter").setScale(0.7).setOrigin(0, 0.5).setAlpha(0)

    this.scoreLabelText = this.add
      .text(170, 350, "ACC.", {
        fontFamily: "Oswald",
        fontSize: "30px",
        color: "#888888",
        align: "center",
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    this.scoreText = this.add
      .text(431, 350, `${this.playResult.score.toFixed(2)} %`, {
        fontFamily: "Oswald",
        fontSize: "40px",
        color: "#fafafa",
        align: "center",
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)

    this.oldScoreLabelText = this.add
      .text(550, 340, "BEST SCORE", {
        fontFamily: "Oswald",
        fontSize: "18px",
        color: "#888888",
        align: "center",
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    this.oldScoreText = this.add
      .text(680, 375, `${this.oldPlayResult.score.toFixed(2)} %`, {
        fontFamily: "Oswald",
        fontSize: "30px",
        color: "#fafafa",
        align: "center",
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)

    const scoreDiff = this.playResult.score - this.oldPlayResult.score

    this.oldScoreDiffText = this.add
      .text(680, 410, `${scoreDiff >= 0 ? "+" : ""}${scoreDiff.toFixed(2)} %`, {
        fontFamily: "Oswald",
        fontSize: "30px",
        color: scoreDiff >= 0 ? "#fafa00" : "#fa0000",
        align: "center",
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)

    this.rankLabelText = this.add
      .text(550, 545, "RANKING", {
        fontFamily: "Oswald",
        fontSize: "18px",
        color: "#888888",
        align: "center",
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    this.rankText = this.add
      .text(680, 580, "Pending...", {
        fontFamily: "Oswald",
        fontSize: "30px",
        color: "#fafafa",
        align: "center",
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)

    this.rankingFrame = this.add.rectangle(1280, 0, 340, 720, 0x000000).setAlpha(0.3).setOrigin(1, 0).setDepth(-2)

    this.add.rectangle(1280, 50, 340, 2, 0x444444).setAlpha(1).setDepth(-1).setOrigin(1, 0)

    this.rankingIndexTexts = []
    this.rankingScoreTexts = []
    this.rankingScreenNameTexts = []
    const rankingFontSize = "24px"

    this.add
      .text(1080, 10, "SCORE", {
        fontFamily: "Oswald",
        fontSize: rankingFontSize,
        color: "#bbbbbb",
        align: "right",
      })
      .setOrigin(1, 0)

    this.add
      .text(1100, 10, "PLAYER", {
        fontFamily: "Oswald",
        fontSize: rankingFontSize,
        color: "#bbbbbb",
        align: "left",
      })
      .setOrigin(0, 0)

    for (const rankingIndex of Array(25).keys()) {
      const y = 60 + 30 * rankingIndex
      this.rankingIndexTexts.push(
        this.add
          .text(950, y, "", {
            fontFamily: "Oswald",
            fontSize: rankingFontSize,
            color: "#888888",
            align: "left",
          })
          .setOrigin(0, 0),
      )
      this.rankingScoreTexts.push(
        this.add
          .text(1080, y, "", {
            fontFamily: "Oswald",
            fontSize: rankingFontSize,
            color: "#fafafa",
            align: "right",
          })
          .setOrigin(1, 0),
      )

      this.rankingScreenNameTexts.push(
        this.add
          .text(1100, y, "", {
            fontFamily: "Noto Sans JP",
            fontSize: rankingFontSize,
            color: "#fafafa",
            align: "left",
          })
          .setOrigin(0, 0),
      )
    }

    this.line1 = this.add.rectangle(300, 385, 320, 2, 0x444444, 30).setDepth(-1).setScale(0, 1)

    this.line2 = this.add.rectangle(300, 605, 320, 2, 0x444444, 30).setDepth(-1).setScale(0, 1)

    this.tweens.add({
      targets: [this.line1, this.line2],
      delay: 450,
      scaleX: {
        value: 1,
        duration: 300,
        ease: Phaser.Math.Easing["Cubic"]["Out"],
      },
    })

    this.judgeTexts = []
    this.judgeLabelTexts = []
    for (const judgeIndex of Array(5).keys()) {
      this.add
        .image(830, 430 + 35 * judgeIndex, `judge-${judgeIndex}`)
        .setScale(0.4)
        .setOrigin(judgeIndex === 0 ? 0.03 : 0, 0.5)
        .setAlpha(0)

      this.judgeLabelTexts.push(
        this.add
          .text(200, 424 + 35 * judgeIndex, ["PERFECT", "GREAT", "GOOD", "BAD", "MISS"][judgeIndex], {
            fontFamily: "Oswald",
            fontSize: "20px",
            color: ["#e530e5", "#d8a10a", "#3cc43c", "#2f9ec6", "#880aaa"][judgeIndex],
            align: "center",
          })
          .setOrigin(0, 0.5)
          .setAlpha(0),
      )

      this.judgeTexts.push(
        this.add
          .text(400, 424 + 35 * judgeIndex, `${this.playResult.judges[judgeIndex]}`, {
            fontFamily: "Oswald",
            fontSize: "28px",
            color: "#fafafa",
            align: "center",
          })
          .setOrigin(1, 0.5)
          .setAlpha(0),
      )
    }

    this.comboText = this.add
      .text(430, 640, `${this.playResult.maxCombo}`, {
        fontFamily: "Oswald",
        fontSize: "28px",
        color: "#fafafa",
        align: "center",
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)
    this.comboLabelText = this.add
      .text(170, 640, "MAX COMBO", {
        fontFamily: "Oswald",
        fontSize: "20px",
        color: "#888888",
        align: "center",
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    this.tweens.add({
      targets: [this.titleFrame, this.detailFrame, this.subDetailFrame],
      delay: 200,
      scaleY: {
        value: 0.67,
        duration: 400,
        ease: Phaser.Math.Easing["Cubic"]["Out"],
      },
    })

    this.tweens.add({
      targets: [
        this.titleText,
        this.artistText,
        this.noterText,
        this.keyIcon,
        this.diffIcon,
        this.musicIcon,
        this.artistIcon,
        this.noterIcon,
        this.playResult.music.jacket !== undefined ? this.jacketImage : null,
        this.scoreText,
        this.scoreLabelText,
        this.oldScoreText,
        this.oldScoreDiffText,
        this.oldScoreLabelText,
        this.comboText,
        this.comboLabelText,
        this.rankText,
        this.rankLabelText,
        this.judgeTexts[0],
        this.judgeTexts[1],
        this.judgeTexts[2],
        this.judgeTexts[3],
        this.judgeTexts[4],
        this.judgeLabelTexts[0],
        this.judgeLabelTexts[1],
        this.judgeLabelTexts[2],
        this.judgeLabelTexts[3],
        this.judgeLabelTexts[4],
      ],
      delay: 700,
      alpha: {
        value: 1,
        duration: 150,
      },
    })

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
      })
      .on("pointerover", () => {
        this.backButton.setAlpha(1)
      })
      .on("pointerout", () => {
        this.backButton.setAlpha(0.5)
      })

    this.tweetButton = this.add
      .image(790, 500, "icon-twitter")
      .setOrigin(0, 0)
      .setDepth(10)
      .setScale(0.8)
      .setAlpha(0.5)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        ;(async () => {
          this.sound.play("decide")
          this.tweetButton.setAlpha(0.5)
          this.copySnapshot()
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const url =
            "https://twitter.com/intent/tweet?text=" +
            encodeURIComponent(
              `${this.playResult.music.title} (${this.playResult.playConfig.key}KEYS - ${
                {
                  1: "BEGINNER",
                  2: "STANDARD",
                  3: "ADVANCED",
                  4: "EXTRA",
                }[this.playResult.playConfig.difficulty]
              }) ${this.playResult.score.toFixed(
                2,
              )}%\n(画像は自動で挿入されません。スクリーンショットをクリップボードからペーストし、この文章は消してください。)\n#RICORA_Beats\nhttps://beats-ir.tus-ricora.com/`,
            )
          if (window.open(url, "_blank") == null) {
            location.href = url
          }
        })()
      })
      .on("pointerover", () => {
        this.tweetButton.setAlpha(1)
      })
      .on("pointerout", () => {
        this.tweetButton.setAlpha(0.5)
      })

    this.snapButton = this.add
      .image(790, 600, "icon-camera")
      .setOrigin(0, 0)
      .setDepth(10)
      .setScale(0.8)
      .setAlpha(0.5)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.sound.play("decide")
        this.snapButton.setAlpha(0.5)
        this.copySnapshot()
      })
      .on("pointerover", () => {
        this.snapButton.setAlpha(1)
      })
      .on("pointerout", () => {
        this.snapButton.setAlpha(0.5)
      })

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("select", { playConfig: this.playResult.playConfig })
    })

    this.cameras.main.fadeIn(500)
  }

  update(time: number, dt: number) {
    this.particleEmitter.setPosition(this.input.x, this.input.y)
    switch (Math.floor(time / 40) % 4) {
      case 0:
        this.judgeLabelTexts[0].setColor("#e530e5")
        break
      case 1:
        this.judgeLabelTexts[0].setColor("#ffffff")
        break
      case 2:
        this.judgeLabelTexts[0].setColor("#2fdfe2")
        break
      case 3:
        this.judgeLabelTexts[0].setColor("#ffffff")
        break
    }
  }

  private copySnapshot() {
    this.renderer.snapshot((image: HTMLImageElement | Phaser.Display.Color) => {
      if (image instanceof HTMLImageElement) {
        const base64ToBlob = (base64Data: string): Blob => {
          const contentType = "image/png"
          const sliceSize = 512
          const byteCharacters = atob(base64Data)
          const byteArrays: Uint8Array[] = []
          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize)
            const byteNumbers: number[] = new Array(slice.length)
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            byteArrays.push(byteArray)
          }
          return new Blob(byteArrays, { type: contentType })
        }

        navigator.clipboard.write([
          new ClipboardItem({
            "image/png": base64ToBlob(image.src.replace("data:image/png;base64,", "")),
          } as any),
        ])
      }
    })
  }
}
