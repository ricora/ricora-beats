export class CreditScene extends Phaser.Scene {
  constructor() {
    super("credit")
  }

  init() {}

  create() {
    const { width, height } = this.game.canvas

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 128).setDepth(-10)

    this.add
      .zone(width / 2, height / 2, width, height)
      .setInteractive({
        useHandCursor: false,
      })
      .on("pointerdown", () => {})

    this.add
      .image(width / 2, height / 2, "frame-detail")
      .setOrigin(0.5, 0.5)
      .setDepth(-9)

    this.add
      .image(width / 2 - 260, height / 2 - 225, "icon-credit")
      .setOrigin(0, 1)
      .setDepth(1)
      .setScale(0.8)

    this.add
      .text(width / 2 - 260 + 60, height / 2 - 230, "クレジット", {
        fontFamily: "Noto Sans JP",
        fontSize: "55px",
        color: "#ffffff",
      })
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(1)

    this.add.rectangle(width / 2, height / 2 - 220, 530, 3, 0xeeeeee).setDepth(2)

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

    this.add
      .text(width / 2 - 260, height / 2 - 200 - 5, "RICORA Beats", {
        fontFamily: "Noto Sans JP",
        fontSize: "50px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)

    this.add
      .text(width / 2 - 260, height / 2 - 200 + 40, leftCredits, {
        fontFamily: "Noto Sans JP",
        fontSize: "32px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)

    this.add
      .text(width / 2 + 260, height / 2 - 200 + 40, rightCredits, {
        fontFamily: "Noto Sans JP",
        fontSize: "32px",
        color: "#f0f0f0",
        align: "right",
      })
      .setOrigin(1, 0)
      .setScale(0.5)
      .setDepth(1)

    this.add
      .text(width / 2 - 260, height / 2 - 180 + 280, "RICORA", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
    this.add
      .text(width / 2 - 260, height / 2 - 180 + 280 + 17, "https://tus-ricora.com/", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#0275d8",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        if (window.open("https://tus-ricora.com/", "_blank") == null) {
          location.href = "https://tus-ricora.com/"
        }
      })

    this.add
      .text(width / 2 - 260, height / 2 - 180 + 330, "View on GitHub", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#f0f0f0",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)

    this.add
      .text(width / 2 - 260, height / 2 - 180 + 330 + 17, "https://github.com/RICORA/ricora-beats/", {
        fontFamily: "Noto Sans JP",
        fontSize: "25px",
        color: "#0275d8",
      })
      .setOrigin(0, 0)
      .setScale(0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        if (window.open("https://github.com/RICORA/ricora-beats/", "_blank") == null) {
          location.href = "https://github.com/RICORA/ricora-beats/"
        }
      })

    this.add
      .text(width / 2, height / 2 - 180 + 360 * 1.15, "閉じる", {
        fontFamily: "Noto Sans JP",
        fontSize: "35px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(2)

    this.add
      .image(width / 2, height / 2 - 180 + 360 * 1.15, "frame-button")
      .setOrigin(0.5, 0.5)
      .setDepth(1)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.sound.play("cancel")
        this.scene.stop()
        this.scene.resume("select")
      })
  }
}
