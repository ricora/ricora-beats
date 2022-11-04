type NoteType = "circle" | "rectangle"

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
