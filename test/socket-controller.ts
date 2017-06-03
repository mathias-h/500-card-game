import { expect } from "chai"
import { SocketController } from "../src/socket-controller"
import { Player } from "../src/player"
import { Card } from "../common/card"

describe("BoardSocket", () => {
    let socket: SocketController
    const socketMock: SocketIO.Socket = {
        on() {},
        emit() {}
    } as any
    const two = new Card("hearts", "two")
    const three = new Card("hearts", "three")
    const four = new Card("hearts", "four")
    const threeCardsInOrder = [two,three,four]

    beforeEach(() => {
        socket = new SocketController()
    })

    describe("createBoard", () => {
        it("should set constructor values", () => {
            const board = socket["createBoard"]()

            expect(board["onTurnChanged"]).to.eq(socket["notifyTurn"])
            expect(board["onSeriesChanged"]).to.eq(socket["notifySeriesChange"])
        })
        it("should set onCardAdded", () => {
            let called = false
            const card = two

            const playerSocket: SocketIO.Socket = {
                emit(eventName: String, c: Card) {
                    if (eventName == "card-added") {
                        expect(c).to.eq(card)
                        called = true
                    }
                }
            } as any
            socket["playerSockets"][0] = playerSocket

            const board = socket["createBoard"]()
            const player = board["createPlayer"]()

            board["onCardAdded"](player, card)
            expect(called).to.be.true
        })
        it("should set onCardsRemoved", () => {
            let called = false

            const playerSocket: SocketIO.Socket = {
                emit(eventName: String, cs: Card[]) {
                    if (eventName == "cards-removed") {
                        expect(cs).to.eq(threeCardsInOrder)
                        called = true
                    }
                }
            } as any
            socket["playerSockets"][0] = playerSocket

            const board = socket["createBoard"]()
            const player = board["createPlayer"]()

            board["onCardsRemoved"](player, threeCardsInOrder)
            expect(called).to.be.true
        })
        it("should set onCardSelected", () => {
            let called = false
            const card = two

            const playerSocket: SocketIO.Socket = {
                emit(eventName: String, cs: Card[]) {
                    if (eventName == "card-selected") {
                        expect(cs).to.eq(card)
                        called = true
                    }
                }
            } as any
            socket["playerSockets"][0] = playerSocket

            const board = socket["createBoard"]()
            const player = board["createPlayer"]()

            board["onCardSelected"](player, card)
            expect(called).to.be.true
        })
        it("should set onCardDeselected", () => {
            let called = false
            const card = two

            const playerSocket: SocketIO.Socket = {
                emit(eventName: String, cs: Card[]) {
                    if (eventName == "card-deselected") {
                        expect(cs).to.eq(card)
                        called = true
                    }
                }
            } as any
            socket["playerSockets"][0] = playerSocket

            const board = socket["createBoard"]()
            const player = board["createPlayer"]()

            board["onCardDeselected"](player, card)
            expect(called).to.be.true
        })
    })

    describe("setSocket", () => {
        it("should set socket", () => {
            socket.setSocket(socketMock)

            expect(socket["socket"]).to.eq(socketMock)
        })
        it("should handle start-game event", () => {
            let called = false
            socket["startGame"] = (callback: Function) => {
                callback({ok:true})
            }
            const boardSocket: SocketIO.Socket = {
                on(eventName: String, f: (callback: Function) => void) {
                    expect(eventName).to.eq("start-game")

                    const callback = ({ok}:{ok:boolean}) => {
                        expect(ok).to.be.true

                        called = true
                    }

                    f(callback)
                }
            } as any

            socket.setSocket(boardSocket)
            expect(called).to.be.true
        })
    })

    describe("onStartGame", () => {
        let player: Player

        beforeEach(() => {
            socket.setSocket(socketMock)
            player = socket.join(socketMock)
        })

        it("should set joining to false", () => {
            expect(socket["joining"]).to.be.true

            socket["startGame"](() => {})

            expect(socket["joining"]).to.be.false
        })

        it("each player should draw first cards", () => {
            const player1 = socket.join(socketMock)

            expect(player["cards"].length).to.eq(0)
            expect(player1["cards"].length).to.eq(0)

            socket["startGame"](() => {})

            expect(player["cards"].length).to.eq(7)
            expect(player1["cards"].length).to.eq(7)
        })
        it("should notify turn of current player", () => {
            let called = false
            socket["notifyTurn"] = (p: Player) => {
                expect(p).to.eq(player)
                called = true
            }

            socket["startGame"](() => {})
            expect(called).to.be.true
        })
        it("should callback ok", () => {
            let called = false

            socket["startGame"](({ok}:{ok:boolean}) => {
                expect(ok).to.be.true
                called = true
            })

            expect(called).to.be.true
        })
    })

    describe("notifySeriesChange", () => {})

    describe("handleError", () => {})

    describe("join", () => {
        beforeEach(() => {
            socket.setSocket(socketMock)
        })

        it("should allow joins when true", () => {
            expect(socket["joining"]).to.be.true
            expect(socket["board"].players.length).to.eq(0)

            socket.join(socketMock)

            expect(socket["board"].players.length).to.eq(1)            
        })

        it("should set playerSocket", () => {
            const playerSocket: SocketIO.Socket = {
                on() {}
            } as any
            socket.join(playerSocket)
            expect(socket["playerSockets"][0]).to.eq(playerSocket)
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
            socket.setSocket(boardSocket)
            socket.join(socketMock)
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
            const player = socket.join(playerSocket)

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
            const player = socket.join(playerSocket)
            player["selectedCards"] = threeCardsInOrder

            func(({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                expect(player.series[0].series[0].cards).to.deep.eq(threeCardsInOrder)
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

            socket["startAppend"] = (p: Player) => {
                expect(p.id).to.eq(1)
                return (callback: Function) => callback({ok:true})
            }

            socket.join(playerSocket)

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

            socket["doAppend"] = () => {
                return (callback: Function) => callback({ok:true})
            }

            socket.join(playerSocket)

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

            socket["startReplace"] = (p: Player) => {
                expect(p.id).to.eq(1)
                return (callback: Function) => callback({ok:true})
            }

            socket.join(playerSocket)

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

            socket["doReplace"] = () => {
                return (callback: Function) => callback({ok:true})
            }

            socket.join(playerSocket)

            func(({ok}:{ok:boolean}) => {
                expect(ok).to.eq(true)
                called = true
            })
            expect(called).to.be.true
        })

        it("should handle do-draw-pile event", () => {})
        it("should handle do-discard event", () => {})

        it("should not allow joing when false", () => {
            expect(socket["board"].players.length).to.eq(0)

            socket["joining"] = false

            expect(() => socket.join(socketMock)).to.throw()

            expect(socket["board"].players.length).to.eq(0)
        })

        it("should only allow 8 players", () => {
            for (let i = 0; i < 8; i++) {
                socket.join(socketMock)
            }

            expect(socket["board"].players.length).to.eq(8)

            expect(() => socket.join(socketMock)).to.throw()

            expect(socket["board"].players.length).to.eq(8)
        })
    })

    describe("startReplace", () => {})

    describe("doReplace", () => {})

    describe("startAppend", () => {})

    describe("doAppend", () => {})

    describe("notifyTurn", () => {})

    it("getId", () => {
        const random = Math.random

        Math.random = () => 0
        expect(socket["getId"]()).to.eq("0000")

        Math.random = () => 1
        expect(socket["getId"]()).to.eq("10101010")

        Math.random = random
    })

    
})