import { Deck } from "./deck";
import { Player } from "./player"

export class Board {
    players: Player[] = []
    deck: Deck = new Deck()

    join(): Player {
        const player = new Player(this.players.length + 1, this)
        this.players.push(player)
        return player
    }

    leave(player: Player) {
        const playerIndex = this.players.findIndex(p => p.compareTo(player) == 0)

        if (playerIndex == -1) throw new Error("player not found")

        this.players.splice(playerIndex, 1)
    }
}