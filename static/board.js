window.onload = () =>
    fetch("player-colors.json").then(res => res.json()).then(playerColors => {
        const socket = io()
        
        const CardEl = customElements.get("card-el")
        const idMatch = location.search.match(/id=(\w+)/)
        const idBox = document.getElementById("id-box")
        const startGameButton = document.querySelector(".start-game")
        const board = document.getElementById("board")
        const allSeries = board.querySelector("#all-series")
        const scoreBoard = board.querySelector("#score-board")
        const cardsEl = board.querySelector("cards-el")

        if (!idMatch) throw new Error("no id in url")

        const id = idMatch[1]
        idBox.querySelector("p").innerHTML = id

        socket.emit("connect-board", id, ({ok,error}) => {
            if (!ok) {
                throw error.message
            }

            cardsEl.setSocket(socket)

            socket.on("player-joined", (playerId) => {
                const playerEl = document.createElement("div")
                playerEl.className = "player"
                playerEl.setAttribute("id", playerId)
                allSeries.appendChild(playerEl)

                const playerScoreEl = document.createElement("div")
                playerScoreEl.className = "player"
                playerScoreEl.setAttribute("id", playerId)
                playerScoreEl.style.setProperty("--player-color", playerColors[playerId-1])
                playerScoreEl.innerHTML = `<p>player ${playerId}</p><p>0</p>`

                scoreBoard.appendChild(playerScoreEl)
            })

            function setScores() {
                fetch("/get-scores/" + id).then(res => {
                    if (res.status == 404) {
                        res.text().then(alert)
                    }
                    else {
                        res.json().then(scores => {
                            for (const playerId of Object.keys(scores)) {
                                const playerEl = document.querySelector("#score-board .player[id='" + playerId + "']")

                                if (!playerEl) {
                                    throw new Error("player does not exist") // should never be called
                                }
                                
                                playerEl.innerHTML = `<p>player ${playerId}</p><p>${scores[playerId]}</p>`
                            }
                        })
                    }
                })
            }

            startGameButton.addEventListener("click", _ => {
                socket.emit("start-game", () => {
                    idBox.hidden = true
                    board.hidden = false

                    socket.on("series-change", (playerId, seriesId, seriesCards) => {
                        const playerEl = board.querySelector(".player[id='" + playerId + "']")
                        let seriesEl = board.querySelector(".series[id='" + seriesId + "']")

                        if (!seriesEl) {
                            seriesEl = document.createElement("div")
                            seriesEl.className = "series"
                            seriesEl.setAttribute("id", seriesId)
                            playerEl.appendChild(seriesEl)
                        }

                        seriesEl.innerHTML = ""

                        for (const player of Object.keys(seriesCards)) {
                            const cards = seriesCards[player]

                            for (const card of cards) {
                                const cardEl = new CardEl()
                                cardEl.card = new Card(card.suit, card.value)
                                cardEl.style.setProperty("--card-player-color", playerColors[player-1])
                                seriesEl.appendChild(cardEl)
                            }
                        }

                        setScores()
                    })
                })
            })
        })
    })