export class LoginScene extends Phaser.Scene {
    private loginForm: Phaser.GameObjects.DOMElement
    private registerForm: Phaser.GameObjects.DOMElement

    constructor() {
        super("login")
    }

    init() { }

    create() {
        const { width, height } = this.game.canvas

        this.add
            .rectangle(width / 2, height / 2, width, height, 0x000000, 128)
            .setDepth(-10)

        this.add
            .zone(width / 2, height / 2, width, height)
            .setInteractive({
                useHandCursor: false,
            })
            .on("pointerdown", () => { })

        this.add
            .image(width / 2, height / 2, "frame-detail")
            .setOrigin(0.5, 0.5)
            .setDepth(-9)

        this.loginForm = this.add
            .dom(width / 2 - 150, 320)
            .createFromCache("login-form")

        this.registerForm = this.add
            .dom(width / 2 + 150, 320)
            .createFromCache("register-form")

        this.add
            .image(width / 2 - 260, height / 2 - 225, "icon-ir")
            .setOrigin(0, 1)
            .setDepth(1)
            .setScale(0.8)

        this.add
            .text(
                width / 2 - 260 + 60,
                height / 2 - 230,
                "インターネットランキング",
                {
                    fontFamily: "Noto Sans JP",
                    fontSize: "55px",
                    color: "#ffffff",
                }
            )
            .setOrigin(0, 1)
            .setScale(0.5)
            .setDepth(1)

        this.add
            .rectangle(width / 2, height / 2 - 220, 530, 3, 0xeeeeee)
            .setDepth(2)

        this.add
            .text(width / 2 - 150, height / 2 - 180, "ログイン", {
                fontFamily: "Noto Sans JP",
                fontSize: "35px",
                color: "#f0f0f0",
            })
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
            .setDepth(1)

        this.add
            .text(width / 2 + 150, height / 2 - 180, "アカウントを新規作成", {
                fontFamily: "Noto Sans JP",
                fontSize: "35px",
                color: "#f0f0f0",
            })
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
            .setDepth(1)

        this.add
            .text(
                width / 2 - 260,
                height / 2 - 180 + 330,
                "アカウントは1人につき1つ保有するものとします。\n運営者の許可なく1人が複数のアカウントを保有することや、\n複数人が1つのアカウントを共同して保有することはできません。",
                {
                    fontFamily: "Noto Sans JP",
                    fontSize: "35px",
                    color: "#f0f0f0",
                }
            )
            .setOrigin(0, 0.5)
            .setScale(0.5)
            .setDepth(1)

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

    update(time: number, dt: number) {
        const loginFormElement =
            document.getElementById("login-form")?.parentElement?.parentElement
        if (loginFormElement && loginFormElement.style.transformOrigin !== "") {
            loginFormElement.style.transformOrigin = ""
        }
        //console.log(this.scale.displayScale.x)
    }
}
