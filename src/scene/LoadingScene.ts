import WebFont from "webfontloader"
import { MusicTileManager } from "../class/MusicTileManager"

export class LoadingScene extends Phaser.Scene {
    private hasLoadedPhaser: boolean = false
    private hasLoadedFont: boolean = false
    constructor() {
        super("loading")
    }

    preload() {
        this.load.image("logo", "./assets/skin/logo.png")

        this.load.image("frame-title", "./assets/skin/frame_title.png")
        this.load.image("frame-detail", "./assets/skin/frame_detail.png")
        this.load.image("frame-button", "./assets/skin/frame_button.png")

        this.load.image("frame-vertical", "./assets/skin/frame_vertical.png")

        this.load.image("caret-left", "./assets/skin/caret_left.png")
        this.load.image("caret-right", "./assets/skin/caret_right.png")

        this.load.image("jacket-no-image", "./assets/skin/no_image.png")

        this.load.image("icon-music", "./assets/skin/tabler-icons/music.png")
        this.load.image("icon-artist", "./assets/skin/tabler-icons/user.png")
        this.load.image("icon-noter", "./assets/skin/tabler-icons/wand.png")
        this.load.image("icon-config", "./assets/skin/tabler-icons/settings.png")
        this.load.image("icon-ir", "./assets/skin/tabler-icons/world.png")
        this.load.image("icon-credit", "./assets/skin/tabler-icons/info-circle.png")
        this.load.image("icon-help", "./assets/skin/tabler-icons/help.png")
        this.load.image("icon-back", "./assets/skin/tabler-icons/arrow-back-up.png")
        this.load.image("icon-twitter", "./assets/skin/tabler-icons/brand-twitter.png")
        this.load.image("icon-camera", "./assets/skin/tabler-icons/camera.png")
        this.load.image("icon-maximize", "./assets/skin/tabler-icons/maximize.png")
        this.load.image("icon-minimize", "./assets/skin/tabler-icons/minimize.png")
        this.load.image("icon-user", "./assets/skin/tabler-icons/user-circle.png")
        this.load.image("icon-adjustments", "./assets/skin/tabler-icons/adjustments-alt.png")

        this.load.image("music-tile-frame", "./assets/skin/music_tile_frame.png")
        this.load.image(
            "music-tile-selected",
            "./assets/skin/music_tile_selected.png"
        )
        this.load.image(
            "music-detail-frame",
            "./assets/skin/music_detail_frame.png"
        )

        this.load.image("config-frame", "./assets/skin/config_frame.png")

        this.load.image("scroll-bar-frame", "./assets/skin/scroll_bar_frame.png")
        this.load.image("scroll-bar", "./assets/skin/scroll_bar.png")

        this.load.image(
            "play-button-enable",
            "./assets/skin/play_button_enable.png"
        )
        this.load.image(
            "play-button-disable",
            "./assets/skin/play_button_disable.png"
        )
        this.load.image("play-button-light", "./assets/skin/play_button_light.png")

        this.load.image("frame-back", "./assets/skin/frame_back.png")
        this.load.image(
            "frame-back-light-blue",
            "./assets/skin/frame_back_light_blue.png"
        )
        this.load.image(
            "frame-back-light-yellow",
            "./assets/skin/frame_back_light_yellow.png"
        )
        this.load.image(
            "frame-back-light-green",
            "./assets/skin/frame_back_light_green.png"
        )
        this.load.image("frame-main", "./assets/skin/frame_main.png")
        this.load.image("frame-main-light", "./assets/skin/frame_light.png")
        this.load.image("judgebar", "./assets/skin/judgebar.png")
        this.load.image("judgebar-light", "./assets/skin/judgebar_light.png")

        this.load.image("note-rectangle-1", "./assets/skin/note1.png")
        this.load.image("note-rectangle-2", "./assets/skin/note2.png")
        this.load.image("note-rectangle-3", "./assets/skin/note3.png")

        this.load.image("note-circle-1", "./assets/skin/note_circle_1.png")
        this.load.image("note-circle-2", "./assets/skin/note_circle_2.png")
        this.load.image("note-circle-3", "./assets/skin/note_circle_3.png")

        this.load.image("longnote-1", "./assets/skin/longnote1.png")
        this.load.image("longnote-2", "./assets/skin/longnote2.png")
        this.load.image("longnote-3", "./assets/skin/longnote3.png")

        this.load.image("longnote-circle", "./assets/skin/longnote_circle.png")

        this.load.image("judge-0", "./assets/skin/judge_0.png")
        this.load.image("judge-1", "./assets/skin/judge_1.png")
        this.load.image("judge-2", "./assets/skin/judge_2.png")
        this.load.image("judge-3", "./assets/skin/judge_3.png")
        this.load.image("judge-4", "./assets/skin/judge_4.png")

        this.load.image("judge-fast", "./assets/skin/judge_fast.png")
        this.load.image("judge-slow", "./assets/skin/judge_slow.png")

        this.load.image("bomb-1", "assets/skin/bomb1.png")
        this.load.image("bomb-2", "assets/skin/bomb2.png")
        this.load.image("bomb-3", "assets/skin/bomb3.png")

        this.load.image("particle-yellow", "assets/skin/particle_yellow.png")

        this.load.image("key-flash", "./assets/skin/keyflash.png")

        this.load.image("diff-icon-1", "./assets/skin/diff_icon_1.png")
        this.load.image("diff-icon-2", "./assets/skin/diff_icon_2.png")
        this.load.image("diff-icon-3", "./assets/skin/diff_icon_3.png")
        this.load.image("diff-icon-4", "./assets/skin/diff_icon_4.png")

        this.load.image("key-icon-4", "./assets/skin/key_icon_4.png")
        this.load.image("key-icon-5", "./assets/skin/key_icon_5.png")
        this.load.image("key-icon-6", "./assets/skin/key_icon_6.png")
        this.load.image("key-icon-7", "./assets/skin/key_icon_7.png")

        this.load.audio("select", "./assets/sound/se/select.wav")
        this.load.audio("decide", "./assets/sound/se/decide.wav")
        this.load.audio("cancel", "./assets/sound/se/cancel.wav")
        this.load.audio("cursor", "./assets/sound/se/cursor.wav")

        this.load.audio("normal-tap-1", "./assets/sound/se/normal_tap1.wav")
        this.load.audio("normal-tap-2", "./assets/sound/se/normal_tap2.wav")
        this.load.audio("normal-tap-3", "./assets/sound/se/normal_tap3.wav")
        this.load.audio("normal-tap-4", "./assets/sound/se/normal_tap4.wav")
        this.load.audio("normal-tap-5", "./assets/sound/se/normal_tap4.wav")

        this.load.glsl("background", "./assets/shader/synthwave.frag")

        this.load.json("music-list", "./assets/beatmaps/beatmaps.json")

        this.load.html("login-form", "./assets/html/login-form.html")
        this.load.html("register-form", "./assets/html/register-form.html")

        WebFont.load({
            google: {
                families: ["Noto+Sans+JP:900", "Bungee", "Fredoka+One", "Oswald:700"],
            },
            active: () => {
                this.hasLoadedFont = true
            },
            inactive: () => {
                alert("フォントのロードに失敗しました。")
                this.hasLoadedFont = true
            },
        })
    }

    create() {
        const { width, height } = this.game.canvas

        this.add.text(0, 0, "Loading...").setDepth(1)

        // Web Font Loaderのロード完了判定がうまく動かないので選曲シーンで使用する文字を予め強制的に読み込む
        new MusicTileManager(this, 0)
        this.add.rectangle(640, 360, 1280, 720, 0x000000).setDepth(0)

        this.load.on("complete", () => {
            this.hasLoadedPhaser = true
        })

        this.load.start()
    }

    update() {
        if (this.hasLoadedFont && this.hasLoadedPhaser) {
            this.scene.start("title")
        }
    }
}
