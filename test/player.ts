import {SortedArray} from "../src/sorted-array"
import { Board } from "../src/board";
import { Player, AppendType } from "../src/player";
import { Card, suits } from "../src/card";
import { Series } from "../src/series";
import { expect } from "chai";

describe("Player", () => {
    let board: Board
    let player: Player
    const two = new Card(suits[0], "two")
    const three = new Card(suits[0], "three")
    const four = new Card(suits[0], "four")
    const five = new Card(suits[0], "five")

    beforeEach(() => {
        board = new Board()
        player = board.join()
    })

    it("should draw", () => {
        const cards: SortedArray<Card> = player["cards"]

        board.deck.clear()
        board.deck.push(two)

        expect(cards.array.length).to.eq(0)

        player.draw()
        
        expect(cards.array.length).to.eq(1)
        expect(cards.array[0]).to.eq(two)
    })

    describe("select", () => {
        it("should select", () => {
            const selectedCards: SortedArray<Card> = player["selectedCards"]
            const cards: SortedArray<Card> = player["cards"]

            player["cards"] = new SortedArray<Card>([two], Card.compare)

            expect(selectedCards.array.length).to.eq(0)

            player.select(0)

            expect(selectedCards.array.length).to.eq(1)
            expect(selectedCards.array[0]).to.eq(two)
            expect(cards.array.length).to.eq(0)
        })
        it("should handle wrong select", () => {
            expect(() => player.select(0)).to.throw()
        })
    })

    describe("deselect", () => {
        it("should deselect", () => {
            const selectedCards: SortedArray<Card> = player["selectedCards"]
            const cards: SortedArray<Card> = player["cards"]

            player["selectedCards"] = new SortedArray<Card>([two], Card.compare)

            expect(cards.array.length).to.eq(0)

            player.deselect(0)

            expect(cards.array.length).to.eq(1)
            expect(cards.array[0]).to.eq(two)
            expect(selectedCards.array.length).to.eq(0)
        })
        it("should handle select out of bounds", () => {
            expect(() => player.deselect(0)).to.throw()
        })
    })

    describe("getAppendOptions", () => {
        it("should handle after", () => {
            player["series"][0] = new Series()
            player["series"][0].series = [{ player, cards: Player.createSortedArray([two, three, four]) }]
            player["selectedCards"] = Player.createSortedArray([five])

            const options = player.getAppendOptions()

            expect(options[player.id][0]).to.deep.eq({ player, series: 0, type: AppendType.after })
        })

        it("should handle before", () => {
            player["series"][0] = new Series()
            player["series"][0].series = [{ player, cards: Player.createSortedArray([three, four, five]) }]
            player["selectedCards"] = Player.createSortedArray([two])

            const options = player.getAppendOptions()

            expect(options[player.id][0]).to.deep.eq({ player, series: 0, type: AppendType.before })
        })
    })

    it("append", () => {
        player["series"][0] = new Series()
        player["series"][0].series = [{ player, cards: Player.createSortedArray([two, three, four]) }]
        player["selectedCards"] = Player.createSortedArray([five])

        player.append({ player, series: 0, type: AppendType.after })

        expect(player["series"][0].series[1].player).to.eq(player)
        expect(player["series"][0].series[1].cards.array).to.deep.eq([five])
    })

    it("place", () => {
        expect(player["series"].length).to.eq(0)

        player["selectedCards"] = Player.createSortedArray([two, three, four])
        player.place()

        expect(player["series"].length).to.eq(1)
        expect(player["series"][0].series[0].player.id).to.eq(player.id)
        expect(player["series"][0].series[0].cards.array).to.deep.eq([two,three,four])
    })
})