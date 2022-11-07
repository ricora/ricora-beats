type NoteType = "circle" | "rectangle"
type Key = 4 | 5 | 6 | 7

export class PlayConfig {
    public noteSpeed: number
    public noteType: NoteType

    constructor({
        noteSpeed,
        noteType,
    }: {
        noteSpeed: number
        noteType: NoteType
    }) {
        this.noteSpeed = noteSpeed
        this.noteType = noteType
    }
}
