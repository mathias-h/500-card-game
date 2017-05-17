import { Board } from "../src/board"
import { expect } from "chai"

describe("Board", () => {
    let board: Board;

    beforeEach(() => {
        board = new Board();
    })

    it("join", () => {
        const players = []

        players.push(board.join())
        expect(players[0].id).to.eq(1)

        players.push(board.join())
        expect(players[1].id).to.eq(2)

        expect(board.players).to.deep.eq(players)
    })

    it("leave", () => {
        expect(board.players.length).to.eq(0)
        expect(() => board.leave(player)).to.throw()

        const player = board.join()
        expect(board.players.length).to.eq(1)
        board.leave(player)
        expect(board.players.length).to.eq(0)
    })

    
})