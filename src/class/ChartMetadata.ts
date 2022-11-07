type Key = 4 | 5 | 6 | 7

export class ChartMetadata {
    public title: string
    public artist: string
    public noter: string
    public key: Key
    public difficulty: number
    public playlevel: number
    public folder: string
    public file: string
    constructor({
        title,
        artist,
        noter,
        key,
        difficulty,
        playlevel,
        folder,
        file,
    }: {
        title: string
        artist: string
        noter: string
        key: Key
        difficulty: number
        playlevel: number
        folder: string
        file: string
    }) {
        this.title = title
        this.artist = artist
        this.noter = noter
        this.key = key
        this.difficulty = difficulty
        this.playlevel = playlevel
        this.folder = folder
        this.file = file
    }
}
