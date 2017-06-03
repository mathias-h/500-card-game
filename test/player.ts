import { Board } from "../src/board";
import { Player, AppendType } from "../src/player";
import { Card, Joker, suits } from "../common/card";
import { Series } from "../src/series";
import { expect } from "chai";

describe("Player", () => {
    let board: Board
    let player: Player
    let player1: Player
    const two = new Card(suits[0], "two")
    const three = new Card(suits[0], "three")
    const four = new Card(suits[0], "four")
    const five = new Card(suits[0], "five")
    const six = new Card(suits[0], "six")
    const seven = new Card(suits[0], "seven")
    const eight = new Card(suits[0], "eight")
    const joker = new Joker()

    beforeEach(() => {
        board = new Board(() => {}, () => {}, () => {}, () => {}, () => {}, () => {})
        player = board.join()
        player1 = board.join()
    })

    describe("select", () => {
        it("should select", () => {
            const selectedCards = player["selectedCards"]
            const cards = player["cards"]

            player["cards"] = [two]

            expect(selectedCards.length).to.eq(0)

            player.select(0)

            expect(selectedCards.length).to.eq(1)
            expect(selectedCards[0]).to.eq(two)
            expect(cards.length).to.eq(0)
        })
        it("should handle select out of bounds", () => {
            expect(() => player.select(0)).to.throw()

            player["cards"] = [two]

            expect(() => player.select(-1)).to.throw()
            expect(() => player.select(0)).to.not.throw()
            expect(() => player.select(1)).to.throw()
        })
        it("should call onCardSelected", () => {
            let called = false
            player["cards"] = [two]
            player["onCardSelected"] = card => {
                expect(card).to.eq(two)
                called = true
            }

            player.select(0)
            expect(called).to.be.true
        })
    })

    describe("deselect", () => {
        it("should deselect", () => {
            const selectedCards = player["selectedCards"]
            const cards = player["cards"]

            player["selectedCards"] = [two]

            expect(cards.length).to.eq(0)

            player.deselect(0)

            expect(cards.length).to.eq(1)
            expect(cards[0]).to.eq(two)
            expect(selectedCards.length).to.eq(0)
        })
        it("should handle select out of bounds", () => {
            expect(() => player.deselect(0)).to.throw()

            player["selectedCards"] = [two]

            expect(() => player.deselect(-1)).to.throw()
            expect(() => player.deselect(0)).to.not.throw()
            expect(() => player.deselect(1)).to.throw()
        })
        it("should call onCardDeselected", () => {
            let called = false
            player["selectedCards"] = [two]
            player["onCardDeselected"] = card => {
                expect(card).to.eq(two)
                called = true
            }

            player.deselect(0)
            expect(called).to.be.true
        })
    })

    describe("place", () => {
        it("should hande simple case", () => {
            board.currentPlayer = player

            player["selectedCards"] = [two, three, four]
            player.place()

            expect(player["series"][0].series[0].player.id).to.eq(player.id)
            expect(player["series"][0].series[0].cards).to.deep.eq([two,three,four])
            expect(player["selectedCards"].length).to.eq(0)
        })

        it("should throw when you do not have turn", () => {
            board.currentPlayer = player1

            expect(() => player.place()).to.throw()
        })
        it("should call onCardsRemoved", () => {
            let called = false
            player["selectedCards"] = [two, three, four]
            player["onCardsRemoved"] = cards => {
                expect(cards).to.deep.eq([two,three,four])
                called = true
            }

            player.place()
            expect(called).to.be.true
        })
        it("should call onSeriesChanged", () => {
            let called = false
            player["selectedCards"] = [two, three, four]
            player["onSeriesChanged"] = seriesId => {
                expect(seriesId).to.eq(0)
                called = true
            }

            player.place()
            expect(called).to.be.true
        })
    })

    describe("getAppendOptions", () => {
        it("should handle after", () => {
            player["series"][0] = new Series()
            player["series"][0]["insertSeries"](player, [two, three, four])
            player["selectedCards"] = [five]

            const options = player.getAppendOptions()

            expect(options[0]).to.deep.eq({ player, series: 0, type: AppendType.after })
        })

        it("should handle before", () => {
            player["series"][0] = new Series()
            player["series"][0]["insertSeries"](player, [three, four, five])
            player["selectedCards"] = [two]

            const options = player.getAppendOptions()

            expect(options[0]).to.deep.eq({ player, series: 0, type: AppendType.before })
        })

        it("should handle no selected cards", () => {
            const options = player.getAppendOptions()

            expect(options.length).to.eq(0)
        })

        it("should handle invalid cards", () => {
            player["selectedCards"] = [two,four]

            expect(() => player.getAppendOptions()).to.throw()
        })

        it("should handle multiple series", () => {
            player["series"][0] = new Series()
            player["series"][0]["insertSeries"](player, [two])
            player["series"][0]["insertSeries"](player, [three])
            player["selectedCards"] = [four]

            const options = player.getAppendOptions()

            expect(options[0]).to.deep.eq({ player, series: 0, type: AppendType.after })
        })
    })

    describe("append", () => {
        it("should handle simple case", () => {
            board.currentPlayer = player

            player["series"][0] = new Series()
            player["series"][0]["insertSeries"](player, [two, three, four])
            player["selectedCards"] = [five]

            player.append({ player, series: 0, type: AppendType.after })

            expect(player["series"][0].series[1].player).to.eq(player)
            expect(player["series"][0].series[1].cards).to.deep.eq([five])
            expect(player["selectedCards"].length).to.eq(0)
        })

        it("should throw when you do not have turn", () => {
            board.currentPlayer = player1

            expect(() => player.append(null as any)).to.throw()
        })
        it("should call onCardsRemoved", () => {
            let called = false
            player["series"][0] = new Series()
            player["series"][0]["insertSeries"](player, [two])
            player["selectedCards"] = [three,four]
            player["onCardsRemoved"] = cards => {
                expect(cards).to.deep.eq([three,four])
                called = true
            }

            player.append({ player, series: 0, type: AppendType.after })
            expect(called).to.be.true
        })
        it("should call onSeriesChanged", () => {
            let called = false
            player["series"][0] = new Series()
            player["series"][0]["insertSeries"](player, [two])
            player["selectedCards"] = [three,four]
            player["onSeriesChanged"] = seriesId => {
                expect(seriesId).to.eq(0)
                called = true
            }

            player.append({ player, series: 0, type: AppendType.after })
            expect(called).to.be.true
        })
    })
    
    describe("getReplaceOptions", () => {
        it("should handle basic case", () => {
            const series = new Series()
            
            series["insertSeries"](player, [two,joker,four])
            player["selectedCards"] = [three]
            player["series"] = [series]

            const options = player.getReplaceOptions()

            expect(options[0].player).to.eq(player)
            expect(options[0].series).to.eq(0)
            expect(options[0].card).to.eq(1)
        })

        it("should allow only one card", () => {
            player["selectedCards"] = []
            expect(() => player.getReplaceOptions()).to.throw()

            player["selectedCards"] = [two, three]
            expect(() => player.getReplaceOptions()).to.throw()
        })
        it("should handle invalid cards", () => {
            player["selectedCards"] = [two, four]

            expect(() => player.getReplaceOptions()).to.throw()
        })
        it("should handle no selected card", () => {
            player["selectedCards"] = []

            const options = player.getAppendOptions()

            expect(options.length).to.eq(0)
        })
        it("should handle multiple series", () => {
            const series = new Series()

            series["insertSeries"](player, [two,joker])
            series["insertSeries"](player, [four])

            player["selectedCards"] = [three]
            player["series"] = [series]

            const options = player.getReplaceOptions()

            expect(options[0].player).to.eq(player)
            expect(options[0].series).to.eq(0)
            expect(options[0].card).to.eq(1)
        })
    })

    describe("replace", () => {
        it("should handle simple case", () => {
            const series = new Series()
            series["insertSeries"](player, [two, joker])

            player["selectedCards"] = [three]
            player["series"] = [series]

            player.replace({ player, series: 0, card: 1 })

            expect(series.series[0].cards[0]).to.eq(two)
            expect(series.series[0].cards[1]).to.eq(three)
            expect(player["cards"][0] instanceof Joker).to.be.true
            expect(player["selectedCards"].length).to.eq(0)
        })
        it("should only allow one card", () => {
            expect(() => player.replace(null as any)).to.throw()

            player["selectedCards"] = [two,three]
            expect(() => player.replace(null as any)).to.throw()
        })
        it("should throw when you do not have turn", () => {
            board.currentPlayer = player1

            expect(() => player.replace(null as any)).to.throw()
        })
        it("should call onCardAdded", () => {
            let called = false
            const series = new Series()
            series["insertSeries"](player, [two, joker])

            player["selectedCards"] = [three]
            player["series"] = [series]
            player["onCardAdded"] = card => {
                expect(card.suit).to.eq("joker")
                called = true
            }

            player.replace({ player, series: 0, card: 1 })
            expect(called).to.be.true
        })
        it("should call onCardsRemoved", () => {
            let called = false
            const series = new Series()
            series["insertSeries"](player, [two, joker])

            player["selectedCards"] = [three]
            player["series"] = [series]
            player["onCardsRemoved"] = cards => {
                expect(cards).to.deep.eq([three])
                called = true
            }

            player.replace({ player, series: 0, card: 1 })
            expect(called).to.be.true
        })
        it("should call onSeriesChanged", () => {
            let called = false
            const series = new Series()
            series["insertSeries"](player, [two, joker])

            player["selectedCards"] = [three]
            player["series"] = [series]
            player["onSeriesChanged"] = seriesId => {
                expect(seriesId).to.eq(0)
                called = true
            }

            player.replace({ player, series: 0, card: 1 })
            expect(called).to.be.true
        })
    })

    describe("discard", () => {
        it("should handle simple case", () => {
            player["selectedCards"] = [two]

            player.discard()

            expect(player["selectedCards"].length).to.eq(0)
            expect(board.pile.peek()).to.eq(two)
        })
        it("should only allow one card", () => {
            expect(() => player.discard()).to.throw()

            player["selectedCards"] = [two,three]
            expect(() => player.discard()).to.throw()

            player["selectedCards"] = [two]
            expect(() => player.discard()).to.not.throw()
        })
        it("should fisish turn", () => {
            let called = false
            const finishTurn = () => called = true

            player["onFinishTurn"] = finishTurn

            player["selectedCards"] = [two]

            player.discard()
            expect(called).to.be.true
        })
        it("should throw when you do not have turn", () => {
            board.currentPlayer = player1

            expect(() => player.discard()).to.throw()
        })
        it("should call onCardsRemoved", () => {
            let called = false
            player["selectedCards"] = [two]
            player["onCardsRemoved"] = cards => {
                expect(cards).to.deep.eq([two])
                called = true
            }

            player.discard()
            expect(called).to.be.true
        })
        it("should call onFinishTurn", () => {
            let called = false
            player["selectedCards"] = [two]
            player["onFinishTurn"] = () => {
                called = true
            }

            player.discard()
            expect(called).to.be.true
        })
    })

    describe("draw", () => {
        it("should handle simple case", () => {
            const cards = player["cards"]

            board.deck.clear()
            board.deck.push(two)

            expect(cards.length).to.eq(0)

            player.draw()
            
            expect(board.deck.isEmpty).to.be.true
            expect(cards.length).to.eq(1)
            expect(cards[0]).to.eq(two)
        })
        it("should throw when you do not have turn", () => {
            board.currentPlayer = player1

            expect(() => player.draw()).to.throw()
        })
        it("should call onCardAdded", () => {
            let called = false
            board.deck.push(two)

            player["onCardAdded"] = card => {
                expect(card).to.eq(two)
                called = true
            }

            player.draw()
            expect(called).to.be.true
        })
    })

    describe("draw pile", () => {
        it("should draw every card in pile", () => {
            board.pile.push(two)
            board.pile.push(three)
            board.pile.push(four)

            player.drawPile()

            expect(player["cards"][0]).to.eq(four)
            expect(player["cards"][1]).to.eq(three)
            expect(player["cards"][2]).to.eq(two)
            expect(board.pile.isEmpty).to.be.true
        })
        it("should only allow if card in pile", () => {
            expect(() => player.drawPile()).to.throw()
        })
        it("should throw when you do not have turn", () => {
            board.currentPlayer = player1

            expect(() => player.drawPile()).to.throw()
        })
        it("should call onCardAdded", () => {
            let called = 0
            board.pile.push(two)
            board.pile.push(three)

            player["onCardAdded"] = card => {
                if (called == 0) expect(card).to.eq(three)
                else if (called == 1) expect(card).to.eq(two)
                called += 1
            }

            player.drawPile()
            expect(called).to.eq(2)
        })
    })

    describe("firstDraw", () => {
        beforeEach(() => {
            board.deck.clear()
            board.deck.push(two)
            board.deck.push(three)
            board.deck.push(four)
            board.deck.push(five)
            board.deck.push(six)
            board.deck.push(seven)
            board.deck.push(eight)
        })
        it("should draw 7 cards", () => {
            player.firstDraw()

            expect(player["cards"].length).to.eq(7)
            expect(player["cards"][0]).to.eq(eight)
            expect(player["cards"][1]).to.eq(seven)
            expect(player["cards"][2]).to.eq(six)
            expect(player["cards"][3]).to.eq(five)
            expect(player["cards"][4]).to.eq(four)
            expect(player["cards"][5]).to.eq(three)
            expect(player["cards"][6]).to.eq(two)
        })
        it("should call onCardAdded", () => {
            let called = 0

            player["onCardAdded"] = card => {
                if (called == 0) expect(card).to.eq(eight)
                else if (called == 1) expect(card).to.eq(seven)
                else if (called == 2) expect(card).to.eq(six)
                else if (called == 3) expect(card).to.eq(five)
                else if (called == 4) expect(card).to.eq(four)
                else if (called == 5) expect(card).to.eq(three)
                else if (called == 6) expect(card).to.eq(two)
                called += 1
            }

            player.firstDraw()
            expect(called).to.eq(7)
        })
    })

    describe("toggleCard", () => {
        it("should select card if not selected", () => {
            player["cards"] = [two]
            
            player.toggleCard(two)

            expect(player["selectedCards"][0]).to.eq(two)
            expect(player["cards"].length).to.eq(0)
        })
        it("should deselect card if selected", () => {
            player["selectedCards"] = [two]
            
            player.toggleCard(two)

            expect(player["cards"][0]).to.eq(two)
            expect(player["selectedCards"].length).to.eq(0)
        })
        it("should handle card that does not exist", () => {
            player["cards"] = [two]
            player["selectedCards"] = [three]

            expect(() => player.toggleCard(four)).to.throw()
        })
    })

    describe("getCardsFromOption", () => {
        it("should handle simple case", () => {
            const series = new Series()

            series["insertSeries"](player, [two])
            series["insertSeries"](player1, [three])

            player["series"][0] = series

            const cards = Player.getCardsFromOption({ player, series: 0 })

            expect(cards[player.id]).to.deep.eq([two])
            expect(cards[player1.id]).to.deep.eq([three])
        })
    })
})