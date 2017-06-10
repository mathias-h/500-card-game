import { Deck } from "./deck";
import { Player } from "./player"
import { Card } from "../common/card"

export class Board {
    currentPlayer: Player
    players: Player[] = []
    deck: Deck = new Deck()
    pile: Deck

    constructor(
        private onCardAdded: (player: Player, card: Card) => void,
        private onCardsRemoved: (player: Player, cards: Card[]) => void,
        private onCardSelected: (player: Player, card: Card) => void,
        private onCardDeselected: (player: Player, card: Card) => void,
        private onTurnChanged: (player: Player, winningPlayer?: Player) => void,
        private onSeriesChanged: (player: Player, seriesId: number) => void,
        onPileChanged: (card: Card) => void
    ) {
        this.nextTurn = this.nextTurn.bind(this)

        this.pile = new Deck(true, onPileChanged)
    }

    private createPlayer() {
        const cardAdded = (card: Card) => this.onCardAdded(player, card)
        const cardsRemoved = (cards: Card[]) => this.onCardsRemoved(player, cards)
        const cardSelected = (card: Card) => this.onCardSelected(player, card)
        const cardDeselected = (card: Card) => this.onCardDeselected(player, card)

        const player: Player = new Player(
            this.players.length + 1,
            this,
            hasWon => this.nextTurn(hasWon ? player : undefined),
            this.onSeriesChanged,
            cardAdded,
            cardsRemoved,
            cardSelected,
            cardDeselected)

        return player
    }

    join(): Player {
        const player = this.createPlayer()

        this.players.push(player)

        if (!this.currentPlayer) {
            this.currentPlayer = player
        }

        return player
    }

    leave(player: Player) {
        const playerIndex = this.players.findIndex(p => p.compareTo(player) == 0)

        if (playerIndex == -1) throw new Error("player not found")

        this.nextTurn()

        this.players.splice(playerIndex, 1)
    }

    getScores(): { [player: number]: number } {
        const scores: { [player: number]: number } = {}
        for (const player of this.players) {
            let score = 0

            for (const otherPlayer of this.players) {
                for (const series of otherPlayer.series) {
                    score += series.score(player)
                }
            }

            scores[player.id] = score
        }

        return scores
    }

    private nextTurn(winningPlayer?: Player) {
        const nextIndex = (this.players.findIndex(p => p.id == this.currentPlayer.id) + 1) % this.players.length

        this.currentPlayer = this.players[nextIndex]

        this.onTurnChanged(this.currentPlayer, winningPlayer)
        this.currentPlayer.draw()
    }
}