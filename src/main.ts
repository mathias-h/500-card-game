import * as http from "http"
import * as express from "express"
import { SocketController } from "./socket-controller"
import * as socket from "socket.io"

const games: SocketController[] = []

const app = express()
const httpServer = http.createServer(app)
const io = socket(httpServer)

io.on("connection", (socket: SocketIO.Socket) => {
    socket.on("create-game", (callback: Function) => {
        const board = new SocketController()

        games.push(board)

        callback({ok: true, id: board.id })
    })

    socket.on("connect-board", (gameId: string, callback: Function) => {
        const board = games.find(g => g.id == gameId)

        if (!board) {
            callback({ 
                ok: false,
                error: "no game with id " + gameId + " was found"
            })
        }
        else {
            board.setSocket(socket)

            callback({ ok: true })
        }
    })

    socket.on("join-game", (gameId: string, callback: Function) => {
        try {
            const board = games.find(g => g.id == gameId)

            if (!board) {
                callback({ ok: false, error: "no game with id " + gameId + " was found" })
            }
            else {
                const player = board.join(socket)
                
                callback({ ok: true, playerId: player.id })
            }
        }
        catch(error) {
            callback({ ok: false, error: error.message })
        }
    })
})

app.get("/get-scores/:boardId", (req, res) => {
    const boardId = req.params.boardId
    const board = games.find(b => b.id == boardId)

    if (!board) {
        res.status(404).send("board with id " + boardId + " was not found")
    }
    else {
        res.send(board.board.getScores())
    }
})

app.use(express.static("static"))
app.use("/common", express.static("dest/common"))

httpServer.listen(8080)