import { DebugGUI } from "../class/DebugGUI"
import { retryFetch } from "../lib/retryFetch"

interface User {
  screen_name: string
}

export class TitleScene extends Phaser.Scene {
  private debugGUI: DebugGUI

  private startText: Phaser.GameObjects.Text

  private backgroundCamera: Phaser.Cameras.Scene2D.Camera

  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter
  constructor() {
    super("title")
  }

  init() {
    this.debugGUI = new DebugGUI(this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, () => {
      this.debugGUI.destroy()
    })
  }

  preload() {
    const musicList = this.cache.json.get("music-list")

    for (const music of musicList) {
      if (music.jacket !== undefined) {
        this.load.image(`jacket-${music.folder}/${music.jacket}`, `./assets/beatmaps/${music.folder}/${music.jacket}`)
      }
      if (music.preview !== undefined) {
        this.load.audio(
          `preview-${music.folder}/${music.preview}`,
          `./assets/beatmaps/${music.folder}/${music.preview}`,
        )
      }
    }
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

    this.add.image(640, 260, "logo").setScale(0.9)

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

    this.startText = this.add
      .text(640, 550, "touch to start", {
        fontFamily: "Bungee",
        fontSize: "80px",
        color: "#fafafa",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setAlpha(1)
      .setScale(0.5)

    this.add
      .text(1280, 720, "© RICORA", {
        fontFamily: "Noto Sans JP",
        fontSize: "40px",
        color: "#fafafa",
        align: "center",
      })
      .setStroke("#000000", 8)
      .setOrigin(1, 1)
      .setDepth(10)
      .setAlpha(1)
      .setScale(0.5)

    this.add
      .text(0, 0, `BUILD:${process.env.BUILD_DATE}`, {
        fontFamily: "Noto Sans JP",
        fontSize: "40px",
        color: "#fafafa",
        align: "center",
      })
      .setStroke("#000000", 6)
      .setOrigin(0, 0)
      .setDepth(10)
      .setAlpha(1)
      .setScale(0.5)

    // 日本語のフォントがうまく読み込まれないので、使う文字を予め強制的に読み込んでおく
    this.add
      .text(1280, 0, "あ難易度使用数変更譜面現在設定企画立案楽曲", {
        fontFamily: "Noto Sans JP",
        fontSize: "40px",
        color: "#fafafa",
        align: "center",
      })
      .setVisible(false)
    this.getAllUserNames()

    this.add
      .zone(640, 720, 1280, 640)
      .setOrigin(0.5, 1)
      .setInteractive({
        useHandCursor: true,
      })
      .once("pointerdown", () => {
        this.sound.play("decide")
        this.cameras.main.fadeOut(800)
      })
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("select")
    })
    this.cameras.main.fadeIn(500)

    if (
      navigator.userAgent.match(/iPhone|Android.+Mobile/) &&
      !window.matchMedia("(display-mode: fullscreen)").matches
    ) {
      alert(
        "当サイトはPWAに対応しております。\nWebブラウザのメニューからホーム画面に追加をすることで、フルスクリーンでさらに快適に楽しむことができます。",
      )
    }
  }

  update(time: number, dt: number) {
    this.particleEmitter.particleX = this.input.x
    this.particleEmitter.particleY = this.input.y

    this.startText.setAlpha(0.5 + 0.5 * 0.5 * (0.25 * Math.sin((time * 2 * Math.PI) / 1000) + 1))
  }

  private async getAllUserNames(): Promise<void> {
    const usersResponse = await retryFetch(new URL("/users/", process.env.SERVER_URL).toString(), {
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!usersResponse.ok) {
      return
    }
    const users: User[] = await usersResponse.json()
    let text = ""
    for (const user of users) {
      text += `${user.screen_name} `
    }
    this.add
      .text(0, 0, text, {
        fontFamily: "Noto Sans JP",
        fontSize: "40px",
        color: "#fafafa",
        align: "center",
      })
      .setVisible(false)
  }
}
