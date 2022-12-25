import { User } from "../class/User"

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

        const loginFormElement = document
            .getElementById("login-form")
            ?.getElementsByTagName("form")[0]
        if (loginFormElement) {
            loginFormElement.addEventListener("submit", async (event) => {
                event.preventDefault()
                const formData = new FormData(loginFormElement)
                const tokenResponse = await fetch(
                    new URL("/token", process.env.SERVER_URL as string).toString(),
                    {
                        method: "POST",
                        body: formData,
                    }
                )
                if (tokenResponse.ok) {
                    const tokenResponseJSON = await tokenResponse.json()
                    localStorage.setItem("access_token", tokenResponseJSON.access_token)
                    localStorage.setItem("token_type", tokenResponseJSON.token_type)

                    const userResponse = await fetch(
                        new URL("/users/me", process.env.SERVER_URL as string).toString(),
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `${tokenResponseJSON.token_type} ${tokenResponseJSON.access_token}`,
                            },
                        }
                    )
                    if (userResponse.ok) {
                        const userResponseJSON = await userResponse.json()
                        const user = new User({
                            id: userResponseJSON.id,
                            screen_name: userResponseJSON.screen_name,
                            rank: userResponseJSON.rank,
                            performance_point: userResponseJSON.performance_point,
                        })
                        localStorage.setItem("user", JSON.stringify(user))
                        this.sound.play("decide")
                        window.setTimeout(() => {
                            this.scene.start("select")
                        }, 400)
                    }
                } else if (tokenResponse.status === 401) {
                    const tokenResponseJSON = await tokenResponse.json()
                    alert(tokenResponseJSON.detail)
                }
            })
        }

        const registerFormElement = document
            .getElementById("register-form")
            ?.getElementsByTagName("form")[0]
        if (registerFormElement) {
            registerFormElement.addEventListener("submit", async (event) => {
                event.preventDefault()
                const formData = new FormData(registerFormElement)
                const registerResponse = await fetch(
                    new URL("/users/", process.env.SERVER_URL as string).toString(),
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(Object.fromEntries(formData)),
                    }
                )
                if (registerResponse.ok) {
                    const registerResponseJSON = await registerResponse.json()
                    alert(
                        `アカウントを作成しました。\nuser id: ${registerResponseJSON.id}\nscreen name: ${registerResponseJSON.screen_name}`
                    )
                } else if (registerResponse.status === 400) {
                    const registerResponseJSON = await registerResponse.json()
                    alert(registerResponseJSON.detail)
                }
            })
        }

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
    }
}
