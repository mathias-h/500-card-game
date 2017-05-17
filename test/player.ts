import {SortedArray} from "../src/sorted-array"
import { Board } from "../src/board";
import { Player } from "../src/player";
import { Card, suits } from "../src/card";
import { expect } from "chai";

describe("Player", () => {
    let board: Board
    let player: Player
    const two = new Card(suits[0], "two")

    beforeEach(() => {
        board = new Board();
        player = new Player(1, board)
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

    describe("place", () => {
        
    })
})