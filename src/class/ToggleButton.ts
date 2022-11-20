export class ToggleButton extends Phaser.GameObjects.Container {
    private frame: Phaser.GameObjects.Image
    private text: Phaser.GameObjects.Text

    private leftIcon: Phaser.GameObjects.Image
    private rightIcon: Phaser.GameObjects.Image

    public leftZone: Phaser.GameObjects.Zone
    public rightZone: Phaser.GameObjects.Zone

    constructor(public scene: Phaser.Scene, text: string) {
        super(scene, 0, 0)

        this.frame = new Phaser.GameObjects.Image(this.scene, 0, 0, "frame-button")
        this.add(this.frame)

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: "Noto Sans JP",
            fontSize: "35px",
            color: "#fafafa",
        }

        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, text, textStyle)
            .setScale(0.5)
            .setOrigin(0.5)
        this.add(this.text)

        this.leftIcon = scene.add.image(-70, 0, "caret-left").setScale(0.6)
        this.add(this.leftIcon)

        this.rightIcon = scene.add.image(70, 0, "caret-right").setScale(0.7)

        this.add(this.rightIcon)

        this.leftZone = scene.add
            .zone(0, 0, 100, 60)
            .setOrigin(1, 0.5)
            .setInteractive({
                useHandCursor: true,
            })
        this.add(this.leftZone)
        this.rightZone = scene.add
            .zone(0, 0, 100, 60)
            .setOrigin(0, 0.5)
            .setInteractive({
                useHandCursor: true,
            })
        this.add(this.rightZone)
    }

    public setText(text: string) {
        this.text.setText(text)
    }
}
