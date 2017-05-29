import { expect } from "chai";
import { SortedArray } from "../src/sorted-array"
import { Card, suits } from "../src/card";
import { Series } from "../src/series";
import { Player } from "../src/player";

describe("Series", () => {
    const two = new Card(suits[0], "two")
    const three = new Card(suits[0], "three")
    const four = new Card(suits[0], "four")
    const fourOfOtherSuit = new Card(suits[1], "four")
    const five = new Card(suits[0], "five")
    const six = new Card(suits[0], "six")
    const seven = new Card(suits[0], "seven")
    const eight = new Card(suits[0], "eight")
    const nine = new Card(suits[0], "nine")
    const ten = new Card(suits[0], "ten")
    const jack = new Card(suits[0], "jack")
    const queen = new Card(suits[0], "queen")
    const king = new Card(suits[0], "king")
    const ace = new Card(suits[0], "ace")
    const joker = new Card("joker")
    let player: Player
    let series: Series

    beforeEach(() => {
        player = new Player(1, null as any)
        series = new Series()
    })

    describe("place", () => {
        it("should place", () => {
            const cards = new SortedArray<Card>([two,three,four], Card.compare)

            expect(series.series.length).to.eq(0)

            series.place(cards, player)

            expect(series.series.length).to.eq(1)
            expect(series.series[0].cards.array.length).to.eq(3)
            expect(series.series[0].cards.array).to.deep.eq([two,three,four])
            expect(series.series[0].player).to.eq(player)
        })
        it("should handle to few cards", () => {
            const cards = new SortedArray<Card>([two,three], Card.compare)
            expect(() => series.place(cards, player)).to.throw()
        })
    })

    describe("validate", () => {
        it("should handle wrong suit", () => {
            const cards = new SortedArray<Card>([two,three,fourOfOtherSuit], Card.compare)
            expect(series.validateSeries(cards)).to.be.false
        })
        it("should ensure order", () => {
            const cards = new SortedArray<Card>([two,three,five], Card.compare)
            expect(series.validateSeries(cards)).to.be.false
        })
        it("should handle joker", () => {
            const cards = new SortedArray<Card>([two,three,joker], Card.compare)
            expect(series.validateSeries(cards)).not.to.be.false

            const cards1 = new SortedArray<Card>([joker,three,four], Card.compare)
            expect(series.validateSeries(cards1)).not.to.be.false
        })
        it("should handle ace first", () => {
            const cards = new SortedArray<Card>([ace,two,three], Card.compare)
            expect(series.validateSeries(cards)).not.to.be.false
        })
        it("should handle ace last", () => {
            const cards = new SortedArray<Card>([two,three,four,five,six,seven,eight,nine,ten,jack,queen,king,ace], Card.compare)
            expect(series.validateSeries(cards)).not.to.be.false
        })
    })
})