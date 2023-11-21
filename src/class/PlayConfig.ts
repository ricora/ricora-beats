export type NoteType = "circle" | "rectangle" | "line"
type Key = 4 | 5 | 6 | 7
type Difficulty = 1 | 2 | 3 | 4

export class PlayConfig {
  public noteSpeed: number
  public noteType: NoteType
  public key: Key
  public difficulty: Difficulty
  public isMirror: boolean

  constructor({
    noteSpeed,
    noteType,
    isMirror,
    key,
    difficulty,
  }: {
    noteSpeed: number
    noteType: NoteType
    isMirror: boolean
    key: Key
    difficulty: Difficulty
  }) {
    this.noteSpeed = noteSpeed
    this.noteType = noteType
    this.isMirror = isMirror
    this.key = key
    this.difficulty = difficulty
  }
}
