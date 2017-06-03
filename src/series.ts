import { Player, AppendType } from "./player";
import { Card, Joker, values } from "../common/card";

export class Series {
    series: { player: Player, cards: Card[] }[] = []

    private insertSeries(player: Player, cards: Card[], before = false) {
        Series.sortCards(cards)
        
        const series = { player, cards }

        if (before) {
            this.series.unshift(series)
        }
        else {
            this.series.push(series)
        }
    }

    static sortCards(cards: Card[]): Card[] {
        cards.sort(Card.compare)

        const jokers: Joker[] = []

        for (let i = cards.length-1; i >= 0; i--) {
            if (cards[i] instanceof Joker) {
                jokers.push(cards[i] as Joker)
                cards.splice(i, 1)
            }
        }

        for (let i = jokers.length-1; i >= 0; i--) {
            const joker = jokers[i]

            for (let c = cards.length-1; c >= 1; c--) {
                const card = cards[c]
                const prevCard = cards[c-1]
                const representedCard = new Card(card.suit, values[values.indexOf(card.value as any) - 1])

                if (representedCard.isValidAfter(prevCard) && representedCard.isValidBefore(card)) {
                    joker.represents = representedCard
                    cards.splice(c, 0, joker)
                    jokers.splice(i, 1)
                }
            }

        }

        const aceIsFirstCard = cards.length > 1 && cards[0].value == "two" && cards[cards.length-1].value == "ace" && cards[cards.length-2].value != "king"

        if (aceIsFirstCard) {
            cards.unshift(cards.pop() as any)
        }

        if (jokers.length != 0) {
            if (cards.length == 0) {
                throw new Error("you cannot only have a joker")
            }

            const lastCard = cards[cards.length-1]
            const lastRepresentedCard = new Card(lastCard.suit, values[values.indexOf(lastCard.value as any)+1])
            if (lastRepresentedCard.isValidAfter(lastCard)) {
                jokers[0].represents = lastRepresentedCard
                cards.push(jokers[0])
                jokers.splice(0, 1)
            }

            if (jokers.length != 0) {
                const firstCard = cards[0]
                if (lastCard.value == "ace" && firstCard.value == "three") {
                    jokers[0].represents = new Card(firstCard.suit, "two")
                    cards.unshift(jokers[0])
                }
            }
        }

        if (!this.validateSeries(cards, false)) throw new Error("card are not valid")

        return cards
    }

    static validateSeries(cards: Card[], sort: boolean = true) {
        if (cards.length == 0) return true

        if (sort) this.sortCards(cards)

        let previousCard = cards[0]

        for (let i = 1; i < cards.length; i++) {
            if (!cards[i].isValidAfter(previousCard)) return false

            previousCard = cards[i]
        }

        return true
    }

    place(cards: Card[], player: Player) {
        if (cards.length < 3) throw new Error("you must place at least 3 cards")
        if (!Series.validateSeries(cards)) throw new Error("cards are invalid")

        this.insertSeries(player, cards)
    }

    append(cards: Card[], player: Player, appendType: AppendType) {
        if (cards.length < 1) throw new Error("you must append at least one card")
        if (!Series.validateSeries(cards)) throw new Error("cards are invalid")

        if (appendType == AppendType.before && !this.series[0].cards[0].isValidAfter(cards[cards.length-1])) {
            throw new Error("appended cards must be valid before the existsing cards")
        }
        
        if (appendType == AppendType.after) {
            const lastSeries = this.series[this.series.length-1]

            if (!lastSeries.cards[lastSeries.cards.length-1].isValidBefore(cards[0])) {
                throw new Error("appended cards must be valid after the existsing cards")
            }
        }

        this.insertSeries(player, cards, appendType == AppendType.before)
    }

    replace(cardPosition: number, card: Card) {
        let cardIndex = 0

        for (const series of this.series) {
            for (const c of series.cards) {
                if (cardIndex == cardPosition && c instanceof Joker) {
                    if (c.represents.compareTo(card) == 0) {
                        series.cards.splice(cardPosition, 1, card)
                    }
                    else {
                        throw new Error("you cannot replace with wrong card")
                    }
                }

                cardIndex += 1
            }
        }
    }

    score(player: Player): number {
        return this.series.filter(series => series.player == player)
            .map(series => series.cards)
            .reduce((allCards, cards) => allCards.concat(cards), [])
            .reduce((score, card) => {
                if (card instanceof Joker) return score + 25

                switch (card.value) {
                    case "two":
                    case "three":
                    case "four":
                    case "five":
                    case "six":
                    case "seven":
                    case "eight":
                    case "nine":
                        return score + 5
                    case "ten":
                    case "jack":
                    case "queen":
                    case "king":
                        return score + 10
                    case "ace":
                        return score + 15
                    default:
                        throw new Error("invalid card value")
                }
            }, 0)
    }
}