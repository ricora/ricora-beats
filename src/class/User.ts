export class User {
  public screenName: string
  public id: number
  public rank: number
  public performancePoint: number

  constructor({
    screenName,
    id,
    rank,
    performancePoint,
  }: {
    screenName: string
    id: number
    rank: number
    performancePoint: number
  }) {
    this.screenName = screenName
    this.id = id
    this.rank = rank
    this.performancePoint = performancePoint
  }

  get ordinalRank(): string {
    const rankMod10 = this.rank % 10
    const rankMod100 = this.rank % 100
    if (rankMod100 >= 11 && rankMod100 <= 13) {
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
