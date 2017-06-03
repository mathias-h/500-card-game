import { expect } from "chai"
import { BoardSocket } from "../src/board-socket"
import { Player } from "../src/player"
import { Card } from "../common/card"

describe("BoardUi", () => {
    let board: BoardSocket
    const socket: SocketIO.Socket = {
        on: () => {},
        emit: () => {}
    } as any
    const two = new Card("hearts", "two")
    const three = new Card("hearts", "three")
    const four = new Card("hearts", "four")

    beforeEach(() => {
        board = new BoardSocket()
    })

    describe("setSocket", () => {})

    describe("notifySeriesChange", () => {})

    describe("handleError", () => {})

    describe("join", () => {
        beforeEach(() => {
            board.setSocket(socket)
        })

        it("should allow joins when true", () => {
            expect(board["joining"]).to.be.true
            expect(board["board"].players.length).to.eq(0)

            board.join(socket)

            expect(board["board"].players.length).to.eq(1)            
        })

        it("should set playerSocket", () => {
            const playerSocket: SocketIO.Socket = {
                on() {}
            } as any
            board.join(playerSocket)
            expect(board["playerSockets"][0]).to.eq(playerSocket)
        })

        it("should emit player-joined event", () => {
            let called = false
            const boardSocket: SocketIO.Socket = {
                emit(eventName: string, playerId: Number) {
                    expect(eventName).to.eq("player-joined")
                    expect(playerId).to.eq(1)
                    called = true
                },
                on() {}
            } as any
            board.setSocket(boardSocket)
            board.join(socket)
            expect(called).to.be.true
        })

        it("should handle toggle-card event", () => {
            let called = false
            let func: (card: Card, callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (card: Card, callback: Function) => void) {
                    if (eventName == "toggle-card") func = f
                },
                emit() {}
            } as any
            const player = board.join(playerSocket)

            player["cards"] = [two]
            
            func(two, ({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                expect(player["selectedCards"]).to.deep.eq([two])
                called = true
            })
            expect(called).to.be.true
        })
        it("should handle do-place event", () => {
            let called = false
            let func: (callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (callback: Function) => void) {
                    if (eventName == "do-place") func = f
                },
                emit() {}
            } as any
            const player = board.join(playerSocket)
            player["selectedCards"] = [two,three,four]

            func(({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                expect(player.series[0].series[0].cards).to.deep.eq([two,three,four])
                called = true
            })
            expect(called).to.be.true
        })
        it("should handle start-append event", () => {
            let called = false
            let func: (callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (callback: Function) => void) {
                    if (eventName == "start-append") func = f
                },
                emit() {}
            } as any

            board["startAppend"] = (p: Player) => {
                expect(p.id).to.eq(1)
                return (callback: Function) => callback({ok:true})
            }

            board.join(playerSocket)

            func(({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                called = true
            })
            expect(called).to.be.true
        })
        it("should handle do-append event", () => {
            let called = false
            let func: (callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (callback: Function) => void) {
                    if (eventName == "do-append") func = f
                },
                emit() {}
            } as any

            board["doAppend"] = () => {
                return (callback: Function) => callback({ok:true})
            }

            board.join(playerSocket)

            func(({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                called = true
            })
            expect(called).to.be.true
        })
        it("should handle start-replace event", () => {
            let called = false
            let func: (callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (callback: Function) => void) {
                    if (eventName == "start-replace") func = f
                },
                emit() {}
            } as any

            board["startReplace"] = (p: Player) => {
                expect(p.id).to.eq(1)
                return (callback: Function) => callback({ok:true})
            }

            board.join(playerSocket)

            func(({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                called = true
            })
            expect(called).to.be.true
        })
        it("should handle do-replace event", () => {
            let called = false
            let func: (callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (callback: Function) => void) {
                    if (eventName == "do-replace") func = f
                },
                emit() {}
            } as any

            board["doReplace"] = () => {
                return (callback: Function) => callback({ok:true})
            }

            board.join(playerSocket)

            func(({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                called = true
            })
            expect(called).to.be.true
        })

        it("should handle do-draw-pile event", () => {})
        it("should handle do-discard event", () => {})

        it("should not allow joing when false", () => {
            expect(board["board"].players.length).to.eq(0)

            board["joining"] = false

            expect(() => board.join(socket)).to.throw()

            expect(board["board"].players.length).to.eq(0)
        })

        it("should only allow 8 players", () => {

            board.join(socket)
            board.join(socket)
            board.join(socket)
            board.join(socket)
            board.join(socket)
            board.join(socket)
            board.join(socket)
            board.join(socket)

            expect(board["board"].players.length).to.eq(8)

            expect(() => board.join(socket)).to.throw()

            expect(board["board"].players.length).to.eq(8)
        })
    })

    describe("startReplace", () => {})

    describe("doReplace", () => {})

    describe("startAppend", () => {})

    describe("doAppend", () => {})

    describe("notifyTurn", () => {})

    it("getId", () => {
        Math.random = () => 0
        expect(board["getId"]()).to.eq("0000")

        Math.random = () => 1
        expect(board["getId"]()).to.eq("10101010")
    })

    
})