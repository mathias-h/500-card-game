import { Board } from "./board";
import { Card, Joker } from "../common/card";
import { Series } from "./series";

export enum AppendType {
    before,
    after,
    invalid
}

interface Option {
    series: number
    player: Player
}

export interface AppendOption extends Option {
    type: AppendType
}

export interface ReplaceOption extends Option {
    card: number
}

export class Player {
    private cards: Card[] = []
    private selectedCards: Card[] = []
    series: Series[] = []
    private onSeriesChanged: (seriesId: number) => void

    constructor(
        public id: number,
        private board: Board,
        private onFinishTurn: () => void,
        onSeriesChanged: (player: Player, seriesId: number) => void,
        private onCardAdded: (card: Card) => void,
        private onCardsRemoved: (card: Card[]) => void,
        private onCardSelected: (card: Card) => void,
        private onCardDeselected: (card: Card) => void
    ) {
        this.onSeriesChanged = seriesId => onSeriesChanged(this, seriesId)
        this.place = this.place.bind(this)
        this.append = this.append.bind(this)
        this.getAppendOptions = this.getAppendOptions.bind(this)
        this.replace = this.replace.bind(this)
        this.getReplaceOptions = this.getReplaceOptions.bind(this)
        this.drawPile = this.drawPile.bind(this)
        this.draw = this.draw.bind(this)
        this.discard = this.discard.bind(this)
    }

    select(index: number) {
        if (index < 0 || this.cards.length - 1 < index) throw new Error("index out of bounds")
        const card = this.cards[index]
        this.cards.splice(this.cards.findIndex(c => c.compareTo(card) == 0), 1)
        this.selectedCards.push(card)
        this.onCardSelected(card)
    }

    deselect(index: number) {
        if (index < 0 || this.selectedCards.length - 1 < index) throw new Error("index out of bounds")
        const card = this.selectedCards[index]
        this.selectedCards.splice(this.selectedCards.findIndex(c => c.compareTo(card) == 0), 1)
        this.cards.push(card)
        this.onCardDeselected(card)
    }

    place() {
        this.ensureYouHaveTurn()
        const series = new Series()
        series.place(this.selectedCards, this)
        this.series.push(series)
        this.onCardsRemoved(this.selectedCards)
        this.selectedCards = []
        this.onSeriesChanged(this.series.length-1)
    }

    getAppendOptions(): AppendOption[] {
        const options: AppendOption[] = []
        if (!Series.validateSeries(this.selectedCards)) throw new Error("selected cards are invalid")
        if (this.selectedCards.length == 0) return options
        const firstSelectedCard = this.selectedCards[0]
        const lastSelectedCard = this.selectedCards[this.selectedCards.length-1]
        for (const player of this.board.players) {
            for (let i = 0; i < player.series.length; i++) {
                const series = player.series[i]
                const seriesFirstCard = series.series[0].cards[0]
                const lastSeries = series.series[series.series.length-1]
                const seriesLastCard = lastSeries.cards[lastSeries.cards.length-1]
                let type: AppendType = AppendType.invalid
                if (firstSelectedCard.isValidAfter(seriesLastCard)) type = AppendType.after
                else if (lastSelectedCard.isValidBefore(seriesFirstCard)) type = AppendType.before
                if (type != AppendType.invalid) {
                    options.push({
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
        this.ensureYouHaveTurn()
        option.player.series[option.series].append(this.selectedCards, this, option.type)
        this.onCardsRemoved(this.selectedCards)
        this.selectedCards = []
        this.onSeriesChanged(option.series)
    }

    getReplaceOptions(): ReplaceOption[] {
        if (this.selectedCards.length != 1) throw new Error("one card must be selected")
        if (!Series.validateSeries(this.selectedCards)) throw new Error("selected cards are invalid")
        const options: ReplaceOption[] = []
        const selectedCard = this.selectedCards[0]
        for (const player of this.board.players) {
            for (let i = 0; i < player.series.length; i++) {
                const cards: Card[] = []
                for (const singleSeries of player.series[i].series) {
                    cards.push(...singleSeries.cards)
                }
                for (let c = 0; c < cards.length; c++) {
                    const card = cards[c]
                    if (card instanceof Joker && selectedCard.compareTo(card.represents) == 0) {
                        options.push({
                            player,
                            series: i,
                            card: c
                        })
                    }
                }
            }
        }
        return options
    }

    replace(option: ReplaceOption) {
        this.ensureYouHaveTurn()
        if (this.selectedCards.length != 1) throw new Error("you must select one card to replace")
        option.player.series[option.series].replace(option.card, this.selectedCards[0])
        const joker = new Joker()
        this.cards.push(joker)
        this.onCardAdded(joker)
        this.onCardsRemoved(this.selectedCards)
        this.selectedCards = []
        this.onSeriesChanged(option.series)
    }

    discard() {
        this.ensureYouHaveTurn()
        if (this.selectedCards.length != 1) throw new Error("you must select one card to discard")
        this.board.pile.push(this.selectedCards[0])
        this.onCardsRemoved(this.selectedCards)
        this.selectedCards = []
        this.onFinishTurn()
    }

    draw() {
        this.ensureYouHaveTurn()
        const card = this.board.deck.pop()
        this.cards.push(card)
        this.onCardAdded(card)
    }

    drawPile() {
        this.ensureYouHaveTurn()
        if (this.board.pile.isEmpty) throw new Error("there are not any card in the pile to draw")
        while (!this.board.pile.isEmpty) {
            const card = this.board.pile.pop()
            this.cards.push(card)
            this.onCardAdded(card)
        }
    }

    firstDraw() {
        for (let i = 0; i < 7; i++) {
            this.draw()
        }
    }

    toggleCard(card: Card) {
        const selectedIndex = this.selectedCards.findIndex(c => c.compareTo(card) == 0)

        if (selectedIndex != -1) {
            this.deselect(selectedIndex)
        }
        else {
            const cardIndex = this.cards.findIndex(c => c.compareTo(card) == 0)

            if (cardIndex == -1) throw new Error("card was not found")

            this.select(cardIndex)
        }
    }

    private ensureYouHaveTurn() {
        const youHaveTurn = this.board.currentPlayer.compareTo(this) == 0

        if (!youHaveTurn) {
            throw new Error("it is not your turn yet please wait")
        }
    }

    static getCardsFromOption(option: Option): { [player: number]: Card[] } {
        const cards: { [player: number]: Card[] } = {}

        for (const series of option.player.series[option.series].series) {
            cards[series.player.id] = series.cards
        }

        return cards
    }

    compareTo(player: Player): number {
        return this.id - player.id
    }
    static compare(a: Player, b: Player): number {
        return a.compareTo(b);
    }
}