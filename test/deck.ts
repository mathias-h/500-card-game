import { Deck } from "../src/deck"
import { Card, Joker, suits, values } from "../common/card"
import { expect } from "chai"

describe("Deck", () => {
    let deck: Deck
    const two = new Card(suits[0], "two")
    const three = new Card(suits[0], "three")
    const four = new Card(suits[0], "four")
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
            if (card instanceof Joker) {
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

    describe("push", () => {
        it("should call onPileChanged", () => {
            let called = false
            const onPileChanged = (card: Card) => {
                expect(card).to.eq(two)
                called = true
            }
            deck = new Deck(true, onPileChanged)

            deck.push(two)

            expect(called).to.be.true
        })
    })

    describe("drawAll", () => {
        it("should draw all cards", () => {
            deck.clear()

            deck.push(two)
            deck.push(three)
            deck.push(four)

            expect(deck.drawAll()).to.deep.eq([four,three,two])
            expect(deck.isEmpty).to.be.true
        })
        it("should call onPileChanged", () => {
            let called = false
            const onPileChanged = (card: Card) => {
                if (card == two) return
                
                expect(card).to.eq(null)
                called = true
            }
            deck = new Deck(true, onPileChanged)

            deck.push(two)

            deck.drawAll()

            expect(called).to.be.true
        })
        it("should throw if no card in pile", () => {
            deck.clear()

            expect(() => deck.drawAll()).to.throw()
        })
    })
})