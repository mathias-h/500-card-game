import { expect } from "chai"
import { SocketController, Options } from "../src/socket-controller"
import { Player } from "../src/player"
import { Series } from "../src/series"
import { Card } from "../common/card"

describe("SocketController", () => {
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
            expect(board.pile["onPileChanged"]).to.eq(socket["onPileChanged"])
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

    describe("onPileChanged", () => {
        it("should emit pile-changed event", () => {
            let called = false
            const socketMock: SocketIO.Socket = {
                emit(eventName: String, card: Card) {
                    expect(eventName).to.eq("pile-changed")
                    expect(card).to.eq(two)
                    called = true
                },
                on() {}
            } as any

            socket.setSocket(socketMock)

            socket["onPileChanged"](two)

            expect(called).to.be.true
        })
    })

    describe("notifySeriesChange", () => {
        it("should emit series-change event", () => {
            let called = false
            const player = socket.board["createPlayer"]()
            const seriesId = 0
            
            const cards = { [player.id]:threeCardsInOrder}
            const socketMock: SocketIO.Socket = {
                emit(eventName: String, pId: number, sId: number, cs: { player: number, cards: Card[] }[]) {
                    expect(eventName).to.eq("series-change")
                    expect(pId).to.eq(player.id)
                    expect(sId).to.eq(seriesId)

                    expect(cs.length).to.eq(1)
                    expect(cs[0].player).to.eq(player.id)
                    expect(cs[0].cards).to.eq(threeCardsInOrder)
                    called = true
                },
                on() {}
            } as any

            socket.setSocket(socketMock)

            const series = new Series()
            series["insertSeries"](player, threeCardsInOrder)
            player.series[0] = series

            socket["notifySeriesChange"](player, seriesId)
        })
    })

    describe("handleError", () => {
        it("should handle error", () => {
            let called = false
            const callback = ({ ok, error}: { ok: boolean, error: string }) => {
                expect(ok).to.be.false
                expect(error).to.deep.eq("error")
                called = true
            }
            
            socket["handleError"](() => {throw new Error("error")})(callback)
            expect(called).to.be.true
        })
        it("should call fn and call callback", () => {
            let callbackCalled = false
            let fnCalled = false
            const agr1 = 1
            const agr2 = 1
            const result = 1
            const callback = ({ ok, r }: { ok: boolean, r: number }) => {
                expect(ok).to.be.true
                expect(r).to.eq(result)
                callbackCalled = true
            }
            const fn = (a1: number, a2: number) => {
                expect(a1).to.eq(agr1)
                expect(a2).to.eq(agr2)
                fnCalled = true

                return { r: result }
            }

            socket["handleError"](fn)(agr1, agr2, callback)
            expect(callbackCalled).to.be.true
            expect(fnCalled).to.be.true
        })
    })

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
            socket.join(socketMock)
            expect(socket["playerSockets"][0]).to.eq(socketMock)
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
                expect(ok).to.be.true
                called = true
            })
            expect(called).to.be.true
        })

        it("should handle do-draw-pile event", () => {
            let called = false
            let func: (callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (callback: Function) => void) {
                    if (eventName == "do-draw-pile") func = f
                },
                emit() {}
            } as any
            
            socket.board.pile.clear()
            socket.board.pile.push(two)

            const player = socket.join(playerSocket)

            func(() => {
                expect(player["cards"]).to.deep.eq([two])
                called = true
            })
            expect(called).to.be.true
        })
        it("should handle do-end-turn event", () => {
            let called = false
            let func: (callback: Function) => void = null as any
            const playerSocket: SocketIO.Socket = {
                on(eventName: string, f: (callback: Function) => void) {
                    if (eventName == "do-end-turn") func = f
                },
                emit() {}
            } as any
            
            socket.join(playerSocket)
            const player1 = socket.join(socketMock)

            func(() => {
                expect(socket.board.currentPlayer).to.eq(player1)
                called = true
            })
            expect(called).to.be.true
        })

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

    it("startReplace", () => {
        
    })

    describe("doReplace", () => {})

    it("startAppend", () => {
        let called = false
        const options: any[] = []
        const actualOptions: any[] = []
        const player = socket.board["createPlayer"]()
        player["getAppendOptions"] = () => options

        socket["getOptions"] = (os: any[]) => {
            expect(os).to.eq(options)
            
            return actualOptions
        }

        socket["startAppend"](player)(({ options }: { options: Options<any> }) => {
            expect(options).to.eq(actualOptions)
            called = true
        })
        expect(called).to.be.true
    })

    describe("doAppend", () => {})

    describe("notifyTurn", () => {})

    describe("getOptions", () => {})

    it("getId", () => {
        const random = Math.random

        Math.random = () => 0
        expect(socket["getId"]()).to.eq("0000")

        Math.random = () => 1
        expect(socket["getId"]()).to.eq("10101010")

        Math.random = random
    })

    
})