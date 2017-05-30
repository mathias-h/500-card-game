import { expect } from "chai";
import { SortedArray } from "../src/sorted-array"
import { Card, suits } from "../src/card";
import { Series } from "../src/series";
import { Player, AppendType } from "../src/player";

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
        it("should handle invalid cards", () => {
            const cards = new SortedArray<Card>([two, four, five], Card.compare)

            expect(() => series.place(cards, player)).to.throw()
        })
    })

    describe("validate", () => {
        it("should handle no cards", () => {
            const cards = new SortedArray<Card>([], Card.compare)
            expect(Series.validateSeries(cards)).to.be.true
        })
        it("should handle wrong suit", () => {
            const cards = new SortedArray<Card>([two,three,fourOfOtherSuit], Card.compare)
            expect(Series.validateSeries(cards)).to.be.false
        })
        it("should ensure order", () => {
            const cards = new SortedArray<Card>([two,three,five], Card.compare)
            expect(Series.validateSeries(cards)).to.be.false
        })
        it("should handle joker", () => {
            const cards = new SortedArray<Card>([two,three,joker], Card.compare)
            expect(Series.validateSeries(cards)).not.to.be.false
        })
        it("should handle ace first", () => {
            const cards = new SortedArray<Card>([ace,two,three], Card.compare)
            expect(Series.validateSeries(cards)).not.to.be.false
        })
        it("should handle ace last", () => {
            const cards = new SortedArray<Card>([two,three,four,five,six,seven,eight,nine,ten,jack,queen,king,ace], Card.compare)
            expect(Series.validateSeries(cards)).not.to.be.false
        })
    })

    describe("append", () => {
        it("should handle after", () => {
            series.series = [{ player, cards: new SortedArray<Card>([two,three,four], Card.compare) }]
            const cards = new SortedArray<Card>([five], Card.compare)

            series.append(cards, player, AppendType.after)

            expect(series.series[1].cards.array[0]).to.deep.eq(five)
            expect(series.series[1].player).to.deep.eq(player)
        })

        it("should handle before", () => {
            series.series = [{ player, cards: new SortedArray<Card>([three,four,five], Card.compare) }]
            const cards = new SortedArray<Card>([two], Card.compare)

            series.append(cards, player, AppendType.before)

            expect(series.series[0].cards.array[0]).to.deep.eq(two)
            expect(series.series[0].player).to.deep.eq(player)
            expect(series.series.length).to.eq(2)
        })
    })

    describe("score", () => {
        it("should handle number cards", () => {
            series.series = [{ player, cards: new SortedArray<Card>([two], Card.compare) }]
            expect(series.score(player)).to.eq(5)

            series.series = [{ player, cards: new SortedArray<Card>([nine], Card.compare) }]
            expect(series.score(player)).to.eq(5)
        })
        it("should handle picturecards", () => {
            series.series = [{ player, cards: new SortedArray<Card>([ten], Card.compare) }]
            expect(series.score(player)).to.eq(10)

            series.series = [{ player, cards: new SortedArray<Card>([king], Card.compare) }]
            expect(series.score(player)).to.eq(10)
        })
        it("should handle ace", () => {
            series.series = [{ player, cards: new SortedArray<Card>([ace], Card.compare) }]
            expect(series.score(player)).to.eq(15)
        })
        it("should handle joker", () => {
            series.series = [{ player, cards: new SortedArray<Card>([joker], Card.compare) }]
            expect(series.score(player)).to.eq(25)
        })
        it("should handle player", () => {
            series.series = [
                { player, cards: new SortedArray<Card>([two], Card.compare) },
                { player: new Player(2, null as any), cards: new SortedArray<Card>([two], Card.compare) }
            ]
            expect(series.score(player)).to.eq(5)
        })
    })
})