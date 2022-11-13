export interface Beatmap {
    filename: string
    playlevel: number
}


export interface Music {
    [key: string]: any
    title: string
    artist: string
    noter: string
    folder: string
    beatmap_4k_1?: Beatmap
    beatmap_4k_2?: Beatmap
    beatmap_4k_3?: Beatmap
    beatmap_4k_4?: Beatmap
    beatmap_5k_1?: Beatmap
    beatmap_5k_2?: Beatmap
    beatmap_5k_3?: Beatmap
    beatmap_5k_4?: Beatmap
    beatmap_6k_1?: Beatmap
    beatmap_6k_2?: Beatmap
    beatmap_6k_3?: Beatmap
    beatmap_6k_4?: Beatmap
    beatmap_7k_1?: Beatmap
    beatmap_7k_2?: Beatmap
    beatmap_7k_3?: Beatmap
    beatmap_7k_4?: Beatmap
}
