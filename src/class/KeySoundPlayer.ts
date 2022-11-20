import bms from "bms"
import { Chart } from "./Chart"

export class KeySoundPlayer {
    private keySoundSet = new Set<string>()
    private keySoundMap

    constructor(chart: Chart) {
        this.keySoundMap = bms.Keysounds.fromBMSChart(chart.bmsChart)._map
    }
    public loadKeySounds(scene: Phaser.Scene, url: string) {
        Object.keys(this.keySoundMap).forEach((noteValue) => {
            const soundFileName = this.keySoundMap[noteValue]
            if (typeof soundFileName === "string") {
                if (scene.cache.audio.exists(parseInt(noteValue, 36).toString())) {
                    scene.cache.audio.remove(parseInt(noteValue, 36).toString())
                }
                scene.load.audio(
                    parseInt(noteValue, 36).toString(),
                    encodeURIComponent(
                        url.substring(0, url.lastIndexOf("/") + 1) +
                        soundFileName.substring(0, soundFileName.lastIndexOf(".") + 1) +
                        "wav"
                    )
                )
                this.keySoundSet.add(parseInt(noteValue, 36).toString())
            }
        })
    }

    public playKeySound(scene: Phaser.Scene, noteValue: string) {
        if (this.keySoundSet.has(noteValue)) {
            scene.sound.play(noteValue)
        }
    }
}
