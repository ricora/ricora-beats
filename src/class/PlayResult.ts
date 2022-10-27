import { SongInfo } from "./Chart"

export class PlayResult {
    public songInfo: SongInfo
    public judges: number[]
    public maxCombo: number
    public score: number

    constructor(songInfo: SongInfo, judges: number[], score: number, maxCombo: number) {
        this.songInfo = songInfo
        this.judges = judges
        this.score = score
        this.maxCombo = maxCombo
    }
}