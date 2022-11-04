type NoteType = "circle" | "rectangle"

export class PlayConfig {
    public noteSpeed: number
    public noteType: NoteType
    public title: string
    public artist: string
    public difficulty: number

    constructor({ noteSpeed, noteType, title, artist, difficulty }: { noteSpeed: number, noteType: NoteType, title: string, artist:string, difficulty: number }) {
        this.noteSpeed = noteSpeed
        this.noteType = noteType
        this.title = title
        this.artist = artist
        this.difficulty = difficulty
    }
}
