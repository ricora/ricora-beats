export class User {
    public screen_name: string
    public id: number
    public rank: number
    public performance_point: number

    constructor({
        screen_name,
        id,
        rank,
        performance_point,
    }: {
        screen_name: string,
        id: number,
        rank: number,
        performance_point: number
    }
    ) {
        this.screen_name = screen_name
        this.id = id
        this.rank = rank
        this.performance_point = performance_point
    }

    get ordinalRank(): string {
        const rankMod10 = this.rank % 10
        const rankMod100 = this.rank % 100
        if ((11 <= rankMod100) && (rankMod100 <= 13)) {
            return `${this.rank}th`
        } else if (rankMod10 === 1) {
            return `${this.rank}st`
        } else if (rankMod10 === 2) {
            return `${this.rank}nd`
        } else if (rankMod10 === 3) {
            return `${this.rank}rd`
        } else {
            return `${this.rank}th`
        }
    }
}
