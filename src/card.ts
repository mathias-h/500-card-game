export const suits = [
    "hearts",
    "speades",
    "diamonds",
    "clubs",
    "joker"
]

export const values = [
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "jack",
    "queen",
    "king",
    "ace"
]

export class Card {
    public suit: string
    public value: string | null = null

    constructor(suit: string, value?: string) {
        if (suits.indexOf(suit) == -1) {
            throw new Error("suit not valid: " + suit)
        }
        else {
            this.suit = suit
        }

        if (value && values.indexOf(value) == -1) {
            throw new Error("value not valid: " + value)
        }
        if (value) {
            this.value = value
        }
    }

    isValidAfter(c: Card) {
        return this.suit == c.suit && values.indexOf(this.value as any) - values.indexOf(c.value as any) == 1
    }

    isValidBefore(c: Card) {
        return this.suit == c.suit && values.indexOf(this.value as any) - values.indexOf(c.value as any) == -1
    }

    compareTo(c: Card) {
        const suitCompare = suits.indexOf(this.suit) - suits.indexOf(c.suit)

        if (suitCompare == 0) {
            if (this.value == undefined || c.value == undefined) return 0

            return values.indexOf(this.value) - values.indexOf(c.value)
        }

        return suitCompare
    }
    static compare(a: Card, b: Card) {
        return a.compareTo(b)
    }
}