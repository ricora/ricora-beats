export type NoteType = "circle" | "rectangle"
type Key = 4 | 5 | 6 | 7
type Difficulty = 1 | 2 | 3 | 4

export class PlayConfig {
    public noteSpeed: number
    public noteType: NoteType
    public key: Key
    public difficulty: Difficulty

    constructor({
        noteSpeed,
        noteType,
        key,
        difficulty,
    }: {
        noteSpeed: number
        noteType: NoteType
        key: Key
        difficulty: Difficulty
    }) {
        this.noteSpeed = noteSpeed
        this.noteType = noteType
        this.key = key
        this.difficulty = difficulty
    }
}
