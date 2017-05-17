import { Stack } from "./stack";
import { Card, suits, values } from "./card"

export class Deck extends Stack<Card> {
    constructor() {
        const cards = []
        cards.push(new Card("joker"))
        cards.push(new Card("joker"))
        cards.push(new Card("joker"))

        for (let s = 0; s < 4; s++) {
            const suit = suits[s]

            for (let v = 0; v < 13; v++) {
                const value = values[v]
                const card = new Card(suit, value)

                cards.push(card)
            }
        }

        let currentIndex = cards.length
        let temporaryValue
        let randomIndex

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1
            temporaryValue = cards[currentIndex]
            cards[currentIndex] = cards[randomIndex]
            cards[randomIndex] = temporaryValue
        }

        super(cards)
    }
}