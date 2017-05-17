import { expect } from "chai";
import { Card, suits, values } from "../src/card";

describe("Card", () => {
    it("should create card", () => {
        new Card(suits[0], values[0])
        new Card(suits[1], values[0])
        new Card(suits[0], values[1])

        expect(() => new Card("NOT_SUIT", values[0])).to.throw()
        expect(() => new Card(suits[0], "NOT_VALUES")).to.throw()
    })
})