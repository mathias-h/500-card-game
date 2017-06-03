import { expect } from "chai";
import { Card, Joker, suits } from "../common/card";
import { Series } from "../src/series";
import { Player, AppendType } from "../src/player";

const createPlayer = (id: number) => new Player(id, null as any, () => {}, () => {}, () => {}, () => {}, () => {}, () => {})

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
    const threeCardsInOrder = [two,three,four]
    let joker: Joker
    let player: Player
    let series: Series

    beforeEach(() => {
        joker =  new Joker()
        player = createPlayer(1)
        series = new Series()
    })

    describe("insertSeries", () => {
        it("should handle simple case", () => {
            series["insertSeries"](player, [three, four, two])

            expect(series.series[0].player).to.eq(player)
            expect(series.series[0].cards).to.deep.eq(threeCardsInOrder)
        })
        it("should handle before", () => {
            series.series[0] = { player, cards: [three] }
            series["insertSeries"](player, [two], true)

            expect(series.series[0].player).to.eq(player)
            expect(series.series[0].cards).to.deep.eq([two])
            expect(series.series[1].player).to.eq(player)
            expect(series.series[1].cards).to.deep.eq([three])
        })
    })

    describe("sortCards", () => {
        it("should handle simple case", () => {
            const cards = Series.sortCards([three, two, four])

            expect(cards[0]).to.eq(two)
            expect(cards[1]).to.eq(three)
            expect(cards[2]).to.eq(four)
        })
        it("should handle ace first", () => {
            const cards = Series.sortCards([ace, two, three])

            expect(cards[0]).to.eq(ace)
            expect(cards[1]).to.eq(two)
            expect(cards[2]).to.eq(three)
        })
        it("should handle ace last", () => {
            const cards = Series.sortCards([two, three, four, five, six, seven, eight, nine, ten, jack, queen, king, ace])

            expect(cards[0]).to.eq(two)
            expect(cards[12]).to.eq(ace)
        })
        it("should handle simple joker case", () => {
            const cards = Series.sortCards([two, joker, four])

            expect(cards[0]).to.eq(two)
            expect(cards[1]).to.eq(joker)
            expect(joker.represents.value).to.eq(three.value)
            expect(cards[2]).to.eq(four)
        })
        it("should handle first joker", () => {
            const cards = Series.sortCards([joker, three, four, five, six, seven, eight, nine, ten, jack, queen, king, ace])

            expect(cards[0]).to.eq(joker)
            expect((cards[0] as Joker).represents.value).to.eq(two.value)

            expect(cards[1]).to.eq(three)
        })
        it("should handle last joker", () => {
            const cards = Series.sortCards([two, joker])

            expect(cards[0]).to.eq(two)

            expect(cards[1]).to.eq(joker)
            expect((cards[1] as Joker).represents.value).to.eq(three.value)
        })
        it("should handle invalid cards", () => {
            expect(() => Series.sortCards([two, four])).to.throw()
        })
    })

    describe("validateSeries", () => {
        it("should handle no cards", () => {
            expect(Series.validateSeries([])).to.be.true
        })
        it("should handle wrong suit", () => {
            expect(() => Series.validateSeries([two,three,fourOfOtherSuit])).to.throw()
        })
        it("should ensure order", () => {
            expect(() => Series.validateSeries([two,three,five])).to.throw()
        })
        it("should handle joker", () => {
            expect(Series.validateSeries([two,three,joker])).not.to.be.false
        })
        it("should handle ace first", () => {
            expect(Series.validateSeries([ace,two,three])).not.to.be.false
        })
        it("should handle ace last", () => {
            expect(Series.validateSeries([two,three,four,five,six,seven,eight,nine,ten,jack,queen,king,ace])).not.to.be.false
        })
        it("should only call sortCards if sort is true", () => {
            let called: boolean
            const sortCards = Series.sortCards

            Series.sortCards = (cards: Card[]) => {
                called = true
                return cards
            }

            called = false
            Series.validateSeries([two], false)
            expect(called).to.be.false

            called = false
            Series.validateSeries([two], true)
            expect(called).to.be.true

            Series.sortCards = sortCards
        })
    })

    describe("place", () => {
        it("should place", () => {
            expect(series.series.length).to.eq(0)

            series.place(threeCardsInOrder, player)

            expect(series.series.length).to.eq(1)
            expect(series.series[0].cards.length).to.eq(3)
            expect(series.series[0].cards).to.deep.eq(threeCardsInOrder)
            expect(series.series[0].player).to.eq(player)
        })
        it("should handle to few cards", () => {
            expect(() => series.place([two,three], player)).to.throw()
        })
        it("should handle invalid cards", () => {
            expect(() => series.place([two, four, five], player)).to.throw()
        })
    })

    describe("append", () => {
        it("should handle after", () => {
            series["insertSeries"](player, threeCardsInOrder)
            series.append([five], player, AppendType.after)

            expect(series.series.length).to.eq(2)
            expect(series.series[0].cards).to.deep.eq(threeCardsInOrder)
            expect(series.series[0].player).to.eq(player)
            expect(series.series[1].cards[0]).to.eq(five)
            expect(series.series[1].player).to.eq(player)
        })

        it("should handle before", () => {
            series["insertSeries"](player, [three,four,five])

            series.append([two], player, AppendType.before)

            expect(series.series.length).to.eq(2)
            expect(series.series[0].cards[0]).to.eq(two)
            expect(series.series[0].player).to.eq(player)
            expect(series.series[1].cards).to.deep.eq([three,four,five])
            expect(series.series[1].player).to.eq(player)
        })
        it("should not allow wrong cards to be appended after", () => {
            series["insertSeries"](player, threeCardsInOrder)

            expect(() => series.append([six], player, AppendType.after)).to.throw()
        })
        it("should not allow wrong cards to be appended before", () => {
            series["insertSeries"](player, [four,five,six])

            expect(() => series.append([two], player, AppendType.before)).to.throw()
        })
    })

    describe("replace", () => {
        it("should handle simple case", () => {
            series["insertSeries"](player, [two, joker])

            series.replace(1, three)

            expect(series.series[0].cards[0]).to.eq(two)
            expect(series.series[0].cards[1]).to.eq(three)
        })
        it("should handle wrong card", () => {
            series["insertSeries"](player, [two, joker])

            expect(() => series.replace(1, four)).to.throw()
        })
    })

    describe("score", () => {
        it("should handle number cards", () => {
            series["insertSeries"](player, [two])
            expect(series.score(player)).to.eq(5)

            series.series = []
            series["insertSeries"](player, [nine])
            expect(series.score(player)).to.eq(5)
        })
        it("should handle picturecards", () => {
            series["insertSeries"](player, [ten])
            expect(series.score(player)).to.eq(10)

            series.series = []
            series["insertSeries"](player, [king])
            expect(series.score(player)).to.eq(10)
        })
        it("should handle ace", () => {
            series["insertSeries"](player, [ace])
            expect(series.score(player)).to.eq(15)
        })
        it("should handle joker", () => {
            series["insertSeries"](player, [two, joker])
            expect(series.score(player)).to.eq(30)
        })
        it("should handle player", () => {
            series["insertSeries"](player, [two])
            series["insertSeries"](createPlayer(2), [two])

            expect(series.score(player)).to.eq(5)
        })
    })
})