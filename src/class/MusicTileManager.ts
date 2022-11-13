import { Music, Beatmap } from "./Music"
import { MusicTile } from "./MusicTile"

export class MusicTileManager {
    private musicTiles: MusicTile[]
    private musicList: Music[]
    private scrollIndex: number = 0
    private ascTweens: Phaser.Tweens.Tween[]
    private descTweens: Phaser.Tweens.Tween[]

    constructor(public scene: Phaser.Scene) {
        this.musicList = scene.cache.json.get("music-list")

        this.musicTiles = []
        this.ascTweens = []
        this.descTweens = []
        for (const musicTileIndex of Array(7).keys()) {
            this.musicTiles.push(
                new MusicTile(scene)
                    .setPosition(70 + 10 * musicTileIndex, 20 + 100 * musicTileIndex)
                    .setDepth(-1)
            )
            this.musicTiles[musicTileIndex].setMusic(
                this.musicList[
                (this.scrollIndex + musicTileIndex - 3 + this.musicList.length * 3) %
                this.musicList.length
                ]
            )

            scene.add.existing(this.musicTiles[musicTileIndex])
            this.ascTweens.push(
                scene.tweens.add({
                    targets: this.musicTiles[musicTileIndex],
                    x: {
                        value: 70 + 10 * musicTileIndex,
                        duration: 200,
                        ease: "Quintic.Out",
                    },
                    y: {
                        value: 20 + 100 * musicTileIndex,
                        duration: 200,
                        ease: "Quintic.Out",
                    },
                    onStart: () => {
                        this.musicTiles[musicTileIndex].setX(70 + 10 * (musicTileIndex + 1))
                        this.musicTiles[musicTileIndex].setY(
                            20 + 100 * (musicTileIndex + 1)
                        )
                    },
                })
            )
            this.descTweens.push(
                scene.tweens.add({
                    targets: this.musicTiles[musicTileIndex],
                    x: {
                        value: 70 + 10 * musicTileIndex,
                        duration: 200,
                        ease: "Quintic.Out",
                    },
                    y: {
                        value: 20 + 100 * musicTileIndex,
                        duration: 200,
                        ease: "Quintic.Out",
                    },
                    onStart: () => {
                        this.musicTiles[musicTileIndex].setX(70 + 10 * (musicTileIndex - 1))
                        this.musicTiles[musicTileIndex].setY(
                            20 + 100 * (musicTileIndex - 1)
                        )
                    },
                })
            )
        }
    }
    public update() {
        for (const musicTileIndex of Array(7).keys()) {
            const musicTile = this.musicTiles[musicTileIndex]
            this.musicTiles[musicTileIndex].setAlpha(
                1 - (0.8 * Math.abs(musicTile.y - 315)) / 315
            )
        }
    }

    public scroll(asc: boolean) {
        if (asc) {
            this.scrollIndex = (this.scrollIndex + 1) % this.musicList.length
            for (const musicTileIndex of Array(7).keys()) {
                this.musicTiles[musicTileIndex].setMusic(
                    this.musicList[
                    (this.scrollIndex +
                        musicTileIndex -
                        3 +
                        this.musicList.length * 3) %
                    this.musicList.length
                    ]
                )
                this.ascTweens[musicTileIndex].restart()
            }
        } else {
            this.scrollIndex =
                (this.scrollIndex - 1 + this.musicList.length) % this.musicList.length
            for (const musicTileIndex of Array(7).keys()) {
                this.musicTiles[musicTileIndex].setMusic(
                    this.musicList[
                    (this.scrollIndex +
                        musicTileIndex -
                        3 +
                        this.musicList.length * 3) %
                    this.musicList.length
                    ]
                )
                this.descTweens[musicTileIndex].restart()
            }
        }
    }

    public isPlayable(key: number, difficulty: number) {
        return this.musicList[this.scrollIndex].hasOwnProperty(
            `beatmap_${key}k_${difficulty}`
        )
    }
    public getMusic() {
        return this.musicList[this.scrollIndex]
    }

    public getBeatmap(key: number, difficulty: number) {
        return this.musicList[this.scrollIndex][`beatmap_${key}k_${difficulty}`]
    }
}
