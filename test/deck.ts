import { Deck } from "../src/deck"
import { suits, values } from "../src/card"
import { expect } from "chai"

describe("Deck", () => {
    let deck: Deck
    beforeEach(() => {
        deck = new Deck()
    })

    it("set cards", () => {
        expect(deck.size).to.eq(55)

        const cardCount: { [card: string]: number } = {}
        let jokers = 0;

        for (const suit of suits) {
            if (suit == "joker") continue

            for (const value of values) {
                cardCount[suit+value] = 0
            }
        }

        while (!deck.isEmpty) {
            const card = deck.pop()
            if (card.suit == "joker") {
                jokers += 1
            }
            else {
                cardCount[card.suit + card.value] += 1
            }
        }

        expect(jokers).to.eq(3)

        for (const count of Object.values(cardCount)) {
            expect(count).to.eq(1)
        }
    })
})