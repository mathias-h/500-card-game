import { SortedArray } from "./sorted-array"
import { Player } from "./player";
import { Card } from "./card";

export class Series {
    series: { player: Player, cards: SortedArray<Card> }[] = []

    validateSeries(cards: SortedArray<Card>) {
        const ca = new Array(...cards.array)
        const lastCard = ca[ca.length-1]
        const aceIsFirstCard = ca[0].value == "two" && lastCard.value == "ace"

        if (aceIsFirstCard) {
            ca.unshift(ca.pop() as any)
        }

        let previousCard = ca[0]

        for (let i = 1; i < ca.length; i++) {
            if (!ca[i].isValidAfter(previousCard)) return false

            previousCard = ca[i]
        }

        return true
    }

    place(cards: SortedArray<Card>, player: Player) {
        if (cards.array.length < 3) throw new Error("you must place at least 3 cards")
        this.validateSeries(cards)
        this.series.push({ player, cards })
        cards = new SortedArray<Card>([], Card.compare)
    }

    append() {

    }

    replace() {

    }

    // score(player) {

    // }
}