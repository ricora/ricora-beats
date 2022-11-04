import { PlayConfig } from "./PlayConfig"

export class PlayResult {
    public playConfig: PlayConfig
    public judges: number[]
    public maxCombo: number
    public score: number

    constructor({ playConfig, judges, score, maxCombo }: { playConfig: PlayConfig, judges: number[], score: number, maxCombo: number }) {
        this.playConfig = playConfig
        this.judges = judges
        this.score = score
        this.maxCombo = maxCombo
    }
}