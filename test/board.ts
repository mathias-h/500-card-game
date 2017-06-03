import { Board } from "../src/board"
import { Player } from "../src/player"
import { Series } from "../src/series"
import { Card } from "../common/card"
import { expect } from "chai"

describe("Board", () => {
    let board: Board;
    const two = new Card("hearts", "two")
    const three = new Card("hearts", "three")
    const four = new Card("hearts", "four")

    beforeEach(() => {
        board = new Board(() => {}, () => {}, () => {}, () => {}, () => {}, () => {});
    })

    describe("createPlayer", () => {
        it("should set constructor values", () => {
            const player = board["createPlayer"]()

            expect(player.id).to.eq(1)
            expect(player["board"]).to.eq(board)
            expect(player["onFinishTurn"]).to.eq(board["nextTurn"])
        })

        it("should set onSeriesChanged", () => {
            const seriesId = 0
            let called = false

            board["onSeriesChanged"] = (p, sId) => {
                expect(p).to.eq(player)
                expect(sId).to.eq(seriesId)
                called = true
            }

            const player = board["createPlayer"]()
            
            player["onSeriesChanged"](seriesId)
            expect(called).to.be.true
        })

        it("should set onCardsRemoved", () => {
            let called = false

            board["onCardsRemoved"] = (p, cs) => {
                expect(p).to.eq(player)
                expect(cs).to.deep.eq(threeCardsInOrder)
                
                called = true
            }

            const player = board["createPlayer"]()

            player["onCardsRemoved"](threeCardsInOrder)
            expect(called).to.be.true
        })

        it("should set onCardsRemoved", () => {
            let called = false

            board["onCardsRemoved"] = (p, cs) => {
                expect(p).to.eq(player)
                expect(cs).to.deep.eq(threeCardsInOrder)
                
                called = true
            }

            const player = board["createPlayer"]()

            player["onCardsRemoved"](threeCardsInOrder)
            expect(called).to.be.true
        })

        it("should set onCardAdded", () => {
            const card = two
            let called = false

            board["onCardAdded"] = (p, c) => {
                expect(p).to.eq(player)
                expect(c).to.deep.eq(card)
                
                called = true
            }

            const player = board["createPlayer"]()

            player["onCardAdded"](card)
            expect(called).to.be.true
        })

        it("should set onCardSelected", () => {
            const card = two
            let called = false

            board["onCardSelected"] = (p, c) => {
                expect(p).to.eq(player)
                expect(c).to.deep.eq(card)
                
                called = true
            }

            const player = board["createPlayer"]()

            player["onCardSelected"](card)
            expect(called).to.be.true
        })

        it("should set onCardDeselected", () => {
            const card = two
            let called = false

            board["onCardDeselected"] = (p, c) => {
                expect(p).to.eq(player)
                expect(c).to.deep.eq(card)
                
                called = true
            }

            const player = board["createPlayer"]()

            player["onCardDeselected"](card)
            expect(called).to.be.true
        })
    })

    it("join", () => {
        const players = []

        players.push(board.join())
        expect(players[0].id).to.eq(1)

        players.push(board.join())
        expect(players[1].id).to.eq(2)

        expect(players[0]["board"]).to.eq(board)
        expect(players[0]["onFinishTurn"]).to.eq(board["nextTurn"])
        expect(board.currentPlayer).to.eq(players[0])
        expect(board.players).to.deep.eq(players)
    })

    describe("leave", () => {
        it("should handle simple case", () => {
            expect(board.players.length).to.eq(0)
            expect(() => board.leave(player)).to.throw()

            const player = board.join()
            expect(board.players.length).to.eq(1)
            board.leave(player)
            expect(board.players.length).to.eq(0)
        })
        it("should handle player not found", () => {
            const player = board["createPlayer"]()

            expect(() => board.leave(player)).to.throw()
        })
        it("should replace current player", () => {
            const player = board.join()
            const player1 = board.join()

            expect(board.currentPlayer).to.eq(player)

            board.leave(player)

            expect(board.currentPlayer).to.eq(player1)
        })
    })

    describe("getScores", () => {
        it("should handle simple case", () => {
            const player = board.join()
            const player1 = board.join()

            const series = new Series()
            series["insertSeries"](player, [two])
            series["insertSeries"](player, [three])
            series["insertSeries"](player1, [four])
            player.series.push(series)

            const series1 = new Series()
            series1["insertSeries"](player1, [two])
            series1["insertSeries"](player1, [three])
            series1["insertSeries"](player, [four])
            player1.series.push(series1)

            const scores = board.getScores()

            expect(scores[player.id]).to.eq(15)
            expect(scores[player1.id]).to.eq(15)
        })
    })

    describe("nextTurn", () => {
        it("should give next player turn", () => {
            board.join()
            const player = board.join()

            board["nextTurn"]()

            expect(board["currentPlayer"]).to.eq(player)
        })
        it("should handle last player", () => {
            const player = board.join()
            const player1 = board.join()

            board["nextTurn"]()
            expect(board["currentPlayer"]).to.eq(player1)

            board["nextTurn"]()
            expect(board["currentPlayer"]).to.eq(player)
        })
        it("next player should draw", () => {
            const player = board.join()

            expect(player["cards"].length).to.eq(0)

            board["nextTurn"]()

            expect(player["cards"].length).to.eq(1)
        })
        it("should call onTurnChanged", () => {
            let called = false

            board.join()
            const player = board.join()
            const onTurnChanged = (p: Player) => {
                expect(p).to.eq(player)
                called = true
            }

            board["onTurnChanged"] = onTurnChanged
            board["nextTurn"]()
            expect(called).to.be.true
        })
    })
})