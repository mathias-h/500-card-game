import { Board } from "./board";
import { Card } from "./card";
import { SortedArray } from "./sorted-array"
import { Series } from "./series";

export enum AppendType {
    before,
    after,
    invalid
}

interface AppendOption {
    series: number
    type: AppendType
    player: Player
}

export class Player {
    private cards = Player.createSortedArray()
    private selectedCards = Player.createSortedArray()
    private series: Series[] = []

    constructor(public id: number, private board: Board) {}

    select(index: number) {
        if (index < 0 || this.cards.array.length - 1 < index) throw new Error("index out of bounds")
        const card = this.cards.array[index]
        this.cards.remove(card)
        this.selectedCards.insert(card)
    }

    deselect(index: number) {
        if (index < 0 || this.selectedCards.array.length - 1 < index) throw new Error("index out of bounds")
        const card = this.selectedCards.array[index]
        this.selectedCards.remove(card)
        this.cards.insert(card)
    }

    place() {
        const series = new Series()
        series.place(this.selectedCards, this)
        this.series.push(series)
        this.selectedCards = Player.createSortedArray()
    }

    getAppendOptions(): {[playerId: number]:AppendOption[]} {
        const options: {[playerId: number]:AppendOption[]} = {}

        Series.validateSeries(this.selectedCards)

        if (this.selectedCards.array.length == 0) return options

        const firstSelectedCard = this.selectedCards.array[0]
        const lastSelectedCard = this.selectedCards.array[this.selectedCards.array.length-1]
         
        for (const player of this.board.players) {
            options[player.id] = []

            for (let i = 0; i < player.series.length; i++) {
                const series = player.series[i]
                const seriesFirstCard = series.series[0].cards.array[0]
                const lastSeries = series.series[series.series.length-1]
                const seriesLastCard = lastSeries.cards.array[lastSeries.cards.array.length-1]
                let type: AppendType = AppendType.invalid

                if (firstSelectedCard.isValidAfter(seriesLastCard)) type = AppendType.after
                else if (lastSelectedCard.isValidBefore(seriesFirstCard)) type = AppendType.before

                if (type != AppendType.invalid) {
                    options[player.id].push({
                        series: i,
                        type,
                        player
                    })
                }
            }
        }

        return options
    }

    append(option: AppendOption) {
        option.player.series[option.series].append(this.selectedCards, this, option.type)

        this.selectedCards = Player.createSortedArray()
    }

    getReplaceOptions() {
        
    }

    replace() {

    }

    discard() {

    }

    draw() {
        const card = this.board.deck.pop()
        this.cards.insert(card)
    }

    compareTo(player: Player): number {
        return this.id - player.id
    }
    static compare(a: Player, b: Player): number {
        return a.compareTo(b);
    }
    static createSortedArray(cards: Card[] = []) {
        return new SortedArray<Card>(cards, Card.compare)
    }
}