import { Stack } from "./stack";
import { Card, Joker, suits, values } from "../common/card"

export class Deck extends Stack<Card> {
    private onPileChanged?: (card: Card) => void

    constructor(noCards = false, onPileChanged?: (card: Card) => void) {
        if (noCards) {
            super()

            this.onPileChanged = onPileChanged

            return
        }
        
        const cards: Card[] = []

        cards.push(new Joker())
        cards.push(new Joker())
        cards.push(new Joker())

        for (let s = 0; s < 4; s++) {
            const suit = suits[s]

            for (let v = 0; v < 13; v++) {
                const value = values[v]
                const card = new Card(suit, value)

                cards.push(card)
            }
        }

        let currentIndex = cards.length

        while (0 != currentIndex) {
            const randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1
            const temporaryValue = cards[currentIndex]
            cards[currentIndex] = cards[randomIndex]
            cards[randomIndex] = temporaryValue
        }

        super(cards)
    }

    push(card: Card) {
        super.push(card)

        if (this.onPileChanged) this.onPileChanged(card)
    }

    drawAll() {
        if (this.isEmpty) throw new Error("you cannot draw all cards if there are none")

        const cards = []

        while (!this.isEmpty) {
            cards.push(this.pop())
        }

        if (this.onPileChanged) this.onPileChanged(null)

        return cards
    }
}