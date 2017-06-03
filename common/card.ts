const suits = [
    "hearts",
    "spades",
    "diamonds",
    "clubs",
    "joker"
]

const values = [
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

class Card {
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
        if (c instanceof Joker) {
            if (!c.represents) return true
            c = c.represents 
        }

        let self: Card = this
        if (this instanceof Joker) {
            if (!this.represents) return true
            self = this.represents
        }

        return self.suit == c.suit && 
            ((c.value == "ace" && self.value == "two") ||
            values.indexOf(self.value as any) - values.indexOf(c.value as any) == 1)
    }

    isValidBefore(c: Card) {
        if (c instanceof Joker) {
            if (!c.represents) return true
            c = c.represents 
        }

        let self: Card = this
        if (this instanceof Joker) {
            if (!this.represents) return true
            self = this.represents
        }

        return self.suit == c.suit && 
            ((self.value == "ace" && c.value == "two") ||
            values.indexOf(self.value as any) - values.indexOf(c.value as any) == -1)
    }

    compareTo(c: Card) {
        if (c instanceof Joker && c.represents) c = c.represents

        const self = this instanceof Joker && this.represents ? this.represents : this 
        const suitCompare = suits.indexOf(self.suit) - suits.indexOf(c.suit)

        if (suitCompare == 0) {
            if (self.value == undefined || c.value == undefined) return 0

            return values.indexOf(self.value) - values.indexOf(c.value)
        }

        return suitCompare
    }
    
    static compare(a: Card, b: Card) {
        return a.compareTo(b)
    }
}

class Joker extends Card {
    represents: Card

    constructor() {
        super("joker")
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        suits,
        values,
        Card,
        Joker
    }
}