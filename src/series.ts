import { SortedArray } from "./sorted-array"
import { Player, AppendType } from "./player";
import { Card } from "./card";

export class Series {
    series: { player: Player, cards: SortedArray<Card> }[] = []

    static validateSeries(cards: SortedArray<Card>) {
        if (cards.array.length == 0) return true

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
        if (!Series.validateSeries(cards)) throw new Error("cards are invalid")

        this.series.push({ player, cards })
        cards = new SortedArray<Card>([], Card.compare)
    }

    append(cards: SortedArray<Card>, player: Player, appendType: AppendType) {
        if (cards.array.length < 1) throw new Error("you must append at least one card")
        if (!Series.validateSeries(cards)) throw new Error("cards are invalid")

        const newSeries: { player: Player, cards: SortedArray<Card> } = {
            player,
            cards
        }

        if (appendType == AppendType.after) {
            this.series.push(newSeries)
        }
        else if (appendType == AppendType.before) {
            this.series.unshift(newSeries)
        }
    }

    replace() {

    }

    score(player: Player) {
        return this.series.filter(s => s.player.compareTo(player) == 0)
        .map(s => s.cards)
        .map(cs => cs.array
            .reduce((s, c) => {
                if (c.suit == "joker") return s + 25

                switch (c.value) {
                    case "two":
                    case "three":
                    case "four":
                    case "five":
                    case "six":
                    case "seven":
                    case "eight":
                    case "nine":
                        return s + 5
                    case "ten":
                    case "jack":
                    case "queen":
                    case "king":
                        return s + 10
                    case "ace":
                        return s + 15
                }

                return s
            },0))
        .reduce((sum,score) => sum+score,0)
    }
}