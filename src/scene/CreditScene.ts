export class CreditScene extends Phaser.Scene {
  constructor() {
    super("credit")
  }

  init() {}

  create() {
    const { width, height } = this.game.canvas

    this.add
      .zone(width / 2, height / 2, width, height)
      .setInteractive({
        useHandCursor: false,
      })
      .on("pointerdown", () => {})

    const frame = this.add
      .image(width / 2, height / 2, "frame-detail")
      .setOrigin(0.5, 0.5)
      .setDepth(-9)
      .setScale(1, 0)

    const icon = this.add
      .image(width / 2 - 260, height / 2 - 225, "icon-credit")
      .setOrigin(0, 1)
      .setDepth(1)
      .setScale(0.8)
      .setAlpha(0)

    const titleLabel = this.add
      .text(width / 2 - 260 + 60, height / 2 - 230, "クレジット", {
        fontFamily: "Noto Sans JP",
        fontSize: "55px",
        color: "#ffffff",
      })
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const line = this.add
      .rectangle(width / 2, height / 2 - 220, 530, 3, 0xeeeeee)
      .setDepth(2)
      .setScale(0, 1)

    const leftCredits = [
      "企画立案",
      "楽曲",
      "システムサウンド",
      "グラフィック",
      "プログラム",
      "譜面",
      "デバック・テストプレー",
      "",
      "",
    ]

    const rightCredits = (process.env.CREDITS || "").split(/\\r\\n|\\n|\\r/)

    const headerText = this.add
      .text(width / 2 - 260, height / 2 - 200 - 5, "RICORA Beats", {
        fontFamily: "Noto Sans JP",
        fontSize: "50px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const leftCreditsText = this.add
      .text(width / 2 - 260, height / 2 - 200 + 40, leftCredits, {
        fontFamily: "Noto Sans JP",
        fontSize: "32px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const rightCreditsText = this.add
      .text(width / 2 + 260, height / 2 - 200 + 40, rightCredits, {
        fontFamily: "Noto Sans JP",
        fontSize: "32px",
        color: "#f0f0f0",
        align: "right",
      })
      .setOrigin(1, 0)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const linkLabel1 = this.add
      .text(width / 2 - 260, height / 2 - 180 + 280, "RICORA", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)
    const link1 = this.add
      .text(width / 2 - 260, height / 2 - 180 + 280 + 17, "https://tus-ricora.com/", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#0275d8",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        if (window.open("https://tus-ricora.com/", "_blank") == null) {
          location.href = "https://tus-ricora.com/"
        }
      })

    const linkLabel2 = this.add
      .text(width / 2 - 260, height / 2 - 180 + 330, "View on GitHub", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)
    const link2 = this.add
      .text(width / 2 - 260, height / 2 - 180 + 330 + 17, "https://github.com/RICORA/ricora-beats/", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#0275d8",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        if (window.open("https://github.com/RICORA/ricora-beats/", "_blank") == null) {
          location.href = "https://github.com/RICORA/ricora-beats/"
        }
      })

    const closeLabel = this.add
      .text(width / 2, height / 2 - 180 + 360 * 1.15, "閉じる", {
        fontFamily: "Noto Sans JP",
        fontSize: "35px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(2)
      .setAlpha(0)

    const closeButton = this.add
      .image(width / 2, height / 2 - 180 + 360 * 1.15, "frame-button")
      .setOrigin(0.5, 0.5)
      .setDepth(1)
      .setAlpha(0)
      .setInteractive({
        useHandCursor: true,
      })
      .once("pointerdown", () => {
        this.sound.play("cancel")
        this.tweens.add({
          targets: [
            icon,
            titleLabel,
            headerText,
            leftCreditsText,
            rightCreditsText,
            linkLabel1,
            link1,
            linkLabel2,
            link2,
            closeLabel,
            closeButton,
          ],
          delay: 0,
          alpha: {
            value: 0,
            duration: 150,
          },
        })

        this.tweens.add({
          targets: [line],
          delay: 100,
          scaleX: {
            value: 0,
            duration: 200,
            ease: Phaser.Math.Easing.Cubic.Out,
          },
        })
        this.tweens.add({
          targets: [frame],
          delay: 200,
          scaleY: {
            value: 0,
            duration: 200,
            ease: Phaser.Math.Easing.Cubic.Out,
          },
          alpha: {
            value: 0,
            duration: 200,
          },
          onComplete: () => {
            this.scene.stop()
            this.scene.resume("select")
          },
        })
      })

    this.tweens.add({
      targets: [frame],
      delay: 0,
      scaleY: {
        value: 1,
        duration: 200,
        ease: Phaser.Math.Easing.Cubic.Out,
      },
    })

    this.tweens.add({
      targets: [line],
      delay: 100,
      scaleX: {
        value: 1,
        duration: 200,
        ease: Phaser.Math.Easing.Cubic.Out,
      },
    })

    this.tweens.add({
      targets: [
        icon,
        titleLabel,
        headerText,
        leftCreditsText,
        rightCreditsText,
        linkLabel1,
        link1,
        linkLabel2,
        link2,
        closeLabel,
        closeButton,
      ],
      delay: 200,
      alpha: {
        value: 1,
        duration: 150,
      },
    })
  }
}
