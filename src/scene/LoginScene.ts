import { User } from "../class/User"

import { retryFetch } from "../lib/retryFetch"

export class LoginScene extends Phaser.Scene {
  private loginForm: Phaser.GameObjects.DOMElement
  private registerForm: Phaser.GameObjects.DOMElement

  constructor() {
    super("login")
  }

  init(): void {}

  create(): void {
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

    this.loginForm = this.add
      .dom(width / 2 - 150, 320)
      .createFromCache("login-form")
      .setAlpha(0)

    this.registerForm = this.add
      .dom(width / 2 + 150, 320)
      .createFromCache("register-form")
      .setAlpha(0)

    const loginFormElement = document.getElementById("login-form")?.getElementsByTagName("form")[0]
    if (loginFormElement !== undefined) {
      loginFormElement.addEventListener("submit", (event) => {
        event.preventDefault()
        void submitLoginForm(event)
      })
    }
    const submitLoginForm = async (event: SubmitEvent): Promise<void> => {
      const formData = new FormData(loginFormElement)
      const tokenResponse = await retryFetch(new URL("/token", process.env.SERVER_URL).toString(), {
        method: "POST",
        body: formData,
      })
      if (tokenResponse.ok) {
        const tokenResponseJSON = await tokenResponse.json()
        localStorage.setItem("access_token", tokenResponseJSON.access_token)
        localStorage.setItem("token_type", tokenResponseJSON.token_type)

        const userResponse = await retryFetch(new URL("/users/me", process.env.SERVER_URL).toString(), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${tokenResponseJSON.token_type} ${tokenResponseJSON.access_token}`,
          },
        })
        if (userResponse.ok) {
          const userResponseJSON = await userResponse.json()
          const user = new User({
            id: userResponseJSON.id,
            screenName: userResponseJSON.screen_name,
            rank: userResponseJSON.rank,
            performancePoint: userResponseJSON.performance_point,
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
    }

    const registerFormElement = document.getElementById("register-form")?.getElementsByTagName("form")[0]
    if (registerFormElement !== undefined) {
      registerFormElement.addEventListener("submit", (event) => {
        event.preventDefault()
        void submitRegistrationForm(event)
      })
    }
    const submitRegistrationForm = async (event: SubmitEvent): Promise<void> => {
      const formData = new FormData(registerFormElement)
      const registerResponse = await retryFetch(new URL("/users/", process.env.SERVER_URL).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      if (registerResponse.ok) {
        const registerResponseJSON = await registerResponse.json()
        alert(
          `アカウントを作成しました。\nuser id: ${registerResponseJSON.id}\nscreen name: ${registerResponseJSON.screen_name}`,
        )
      } else if (registerResponse.status === 400) {
        const registerResponseJSON = await registerResponse.json()
        alert(registerResponseJSON.detail)
      }
    }

    const icon = this.add
      .image(width / 2 - 260, height / 2 - 225, "icon-ir")
      .setOrigin(0, 1)
      .setDepth(1)
      .setScale(0.8)
      .setAlpha(0)

    const titleLabel = this.add
      .text(width / 2 - 260 + 60, height / 2 - 230, "インターネットランキング", {
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

    const loginLabel = this.add
      .text(width / 2 - 150, height / 2 - 180, "ログイン", {
        fontFamily: "Noto Sans JP",
        fontSize: "35px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const registerLabel = this.add
      .text(width / 2 + 150, height / 2 - 180, "アカウントを新規作成", {
        fontFamily: "Noto Sans JP",
        fontSize: "35px",
        color: "#f0f0f0",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

    const text = this.add
      .text(
        width / 2 - 260,
        height / 2 - 180 + 330,
        "アカウントは1人につき1つ保有するものとします。\n運営者の許可なく1人が複数のアカウントを保有することや、\n複数人が1つのアカウントを共同して保有することはできません。",
        {
          fontFamily: "Noto Sans JP",
          fontSize: "35px",
          color: "#f0f0f0",
        },
      )
      .setOrigin(0, 0.5)
      .setScale(0.5)
      .setDepth(1)
      .setAlpha(0)

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
            loginLabel,
            this.loginForm,
            registerLabel,
            this.registerForm,
            text,
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
        loginLabel,
        this.loginForm,
        registerLabel,
        this.registerForm,
        text,
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

  update(time: number, dt: number): void {
    const loginFormElement = document.getElementById("login-form")?.parentElement?.parentElement
    if (loginFormElement !== null && loginFormElement !== undefined && loginFormElement.style.transformOrigin !== "") {
      loginFormElement.style.transformOrigin = ""
    }
  }
}
