type NoteType = "circle" | "rectangle"
type Key = 4 | 5 | 6 | 7

export class PlayConfig {
    public noteSpeed: number
    public noteType: NoteType
    public title: string
    public artist: string
    public difficulty: number
    public key: Key

    constructor({ noteSpeed, noteType, title, artist, difficulty, key }: { noteSpeed: number, noteType: NoteType, title: string, artist: string, difficulty: number, key: Key }) {
        this.noteSpeed = noteSpeed
        this.noteType = noteType
        this.title = title
        this.artist = artist
        this.difficulty = difficulty
        this.key = key
    }
}
