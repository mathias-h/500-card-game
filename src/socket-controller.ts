import { Board } from "./board"
import { Card } from "../common/card"
import { Player, AppendOption, ReplaceOption } from "./player"

export class SocketController {
    id: string
    private joining = true

    board: Board
    private playerSockets: SocketIO.Socket[] = []
    private socket: SocketIO.Socket

    constructor() {
        this.id = this.getId()

        this.notifyTurn = this.notifyTurn.bind(this)
        this.notifySeriesChange = this.notifySeriesChange.bind(this)
        this.handleError = this.handleError.bind(this)
        this.startAppend = this.startAppend.bind(this)
        this.doAppend = this.doAppend.bind(this)
        this.startReplace = this.startReplace.bind(this)
        this.doReplace = this.doReplace.bind(this)
        this.startGame = this.startGame.bind(this)

        this.board = this.createBoard()
    }

    private createBoard() {
        return new Board(
            (player, card) => this.playerSockets[player.id-1].emit("card-added", card),
            (player, cards) => this.playerSockets[player.id-1].emit("cards-removed", cards),
            (player, card) => this.playerSockets[player.id-1].emit("card-selected", card),
            (player, card) => this.playerSockets[player.id-1].emit("card-deselected", card),
            this.notifyTurn,
            this.notifySeriesChange,
            this.onPileChanged
        )
    }

    setSocket(socket: SocketIO.Socket) {
        this.socket = socket

        socket.on("start-game", this.startGame)
    }

    private startGame(callback: Function) {
        this.joining = false

        this.board.players.forEach(player => player.firstDraw())

        this.notifyTurn(this.board.currentPlayer)

        callback({ ok: true })
    }

    private onPileChanged(card: Card) {
        this.socket.emit("pile-changed", card)
    }

    private notifySeriesChange(player: Player, series: number) {
        this.socket.emit("series-change", player.id, series, Player.getCardsFromOption({ player, series }))
    }

    handleError(fn: (...args: any[]) => any) {
        return (...args: any[]) => {
            const callback = args[args.length-1]

            try {
                const result = fn(...args.slice(0, args.length-1)) || {}

                callback(Object.assign({ ok: true }, result))
            } catch (error) {
                callback({ ok: false, error: error.message })
            }
        }
    }

    join(socket: SocketIO.Socket) {
        if (this.board.players.length == 8) throw new Error("board is full")

        if (this.joining) {
            const player = this.board.join()

            this.playerSockets[player.id-1] = socket

            this.socket.emit("player-joined", player.id)

            socket.on("toggle-card", (card: Card, callback: Function) => {
                card = new Card(card.suit, card.value)

                this.handleError(() => player.toggleCard(card))(callback)
            })
            socket.on("do-place", this.handleError(player.place))
            socket.on("start-append", this.startAppend(player))
            socket.on("do-append", this.doAppend())
            socket.on("start-replace", this.startReplace(player))
            socket.on("do-replace", this.doReplace())
            socket.on("do-draw-pile", this.handleError(player.drawPile))
            socket.on("do-discard", this.handleError(player.discard))

            return player
        }
        else {
            throw new Error("you cannot join anymore")
        }
    }

    private startReplace(player: Player) {
        return this.handleError(() => {
            const options = player.getReplaceOptions().map(option => ({
                cards: Player.getCardsFromOption(option),
                option: Object.assign(option, { player: option.player.id })
            }))

            return { options }
        })
    }

    private doReplace() {
        return this.handleError((option: ReplaceOption) => {
            option.player = this.board.players.find(p => p.id == (option.player as any)) as Player
            option.player.replace(option)
        })
    }

    private startAppend(player: Player) {
        return this.handleError(() => {
            const options = player.getAppendOptions().map(option => ({ 
                cards: Player.getCardsFromOption(option),
                option: Object.assign(option, { player: option.player.id })
            }))

            return { options }
        })
    }
    private doAppend() {
        return this.handleError((option: AppendOption) => {
            option.player = this.board.players.find(p => p.id == (option.player as any)) as Player
            option.player.append(option)
        })
    }

    private notifyTurn(player: Player) {
        this.playerSockets.forEach(s => s.emit("turn-changed", player.id))
    }

    private getId(): string {
        let id = ""

        for (let i = 0; i < 4; i++) {
            id += Math.floor(Math.random()*10)
        }

        return id;
    }
}