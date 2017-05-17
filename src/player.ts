import { Board } from "./board";
import { Card, values } from "./card";
import { SortedArray } from "./sorted-array"
import { Series } from "./series";

enum AppendOption {
    before,
    after,
    invalid
}

export class Player {
    private cards = Player.createSortedArray()
    private selectedCards = Player.createSortedArray()
    private series: Series = new Series()

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

    place(player?: Player) {
        this.series.place(this.selectedCards, player || this)

        this.selectedCards = Player.createSortedArray()
    }

    getAppendOptions() {
        this.series.validateSeries(this.selectedCards)

        const firstSelectedCard = this.selectedCards.array[0]
        const lastSelectedCard = this.selectedCards.array[this.selectedCards.array.length-1]

        return this.board.players
            .map(p => ({ player: p, series: p.series.series }))
            .filter(({player, series}) => ({ player, series: series.map(s => {
                if (firstSelectedCard.isValidAfter(s.cards.array[s.cards.array.length-1])) return AppendOption.after
                if (lastSelectedCard.isValidBefore(s.cards.array[0])) return AppendOption.before
                return AppendOption.invalid
            }) }))
    }

    append() {

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
    static createSortedArray() {
        return new SortedArray<Card>([], Card.compare)
    }
}