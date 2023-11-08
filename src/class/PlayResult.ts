import { type PlayConfig } from "./PlayConfig"
import { type Music } from "./Music"
export class PlayResult {
  public music: Music
  public playConfig: PlayConfig
  public judges: number[]
  public maxCombo: number
  public score: number

  constructor({
    music,
    playConfig,
    judges,
    score,
    maxCombo,
  }: {
    music: Music
    playConfig: PlayConfig
    judges: number[]
    score: number
    maxCombo: number
  }) {
    this.music = music
    this.playConfig = playConfig
    this.judges = judges
    this.score = score
    this.maxCombo = maxCombo
  }
}
