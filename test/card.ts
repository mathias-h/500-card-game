import { expect } from "chai";
import { Card, Joker, suits, values } from "../common/card";

describe("Card", () => {
    it("should create card", () => {
        new Card(suits[0], values[0])
        new Card(suits[1], values[0])
        new Card(suits[0], values[1])

        expect(() => new Card("NOT_SUIT", values[0])).to.throw()
        expect(() => new Card(suits[0], "NOT_VALUES")).to.throw()
    })

    describe("valid after", () => {
        it("should be valid", () => {
            expect(new Card(suits[0], values[1]).isValidAfter(new Card(suits[0], values[0]))).to.be.true
            expect(new Card(suits[0], values[values.length-1]).isValidAfter(new Card(suits[0], values[values.length-2]))).to.be.true
        })
        it("should not be valid", () => {
            expect(new Card(suits[0], values[2]).isValidAfter(new Card(suits[0], values[0]))).to.be.false
            expect(new Card(suits[0], values[values.length-1]).isValidAfter(new Card(suits[0], values[values.length-3]))).to.be.false
            expect(new Card(suits[0], values[1]).isValidAfter(new Card(suits[1], values[0]))).to.be.false
        })
        it("should handle ace", () => {
            expect(new Card(suits[0], "two").isValidAfter(new Card(suits[0], "ace"))).to.be.true
        })
        it("should handle joker", () => {
            const j = new Joker()
            j.represents = new Card(suits[0], values[1])
            expect(j.isValidAfter(new Card(suits[0], values[0]))).to.be.true

            expect(new Joker().isValidAfter(new Card(suits[0], values[1]))).to.be.true
            expect(new Joker().isValidAfter(new Card(suits[1], values[0]))).to.be.true
            expect(new Joker().isValidAfter(new Card(suits[1], values[1]))).to.be.true

            expect(new Card(suits[0], values[0]).isValidAfter(new Joker())).to.be.true
            expect(new Card(suits[0], values[1]).isValidAfter(new Joker())).to.be.true
            expect(new Card(suits[1], values[0]).isValidAfter(new Joker())).to.be.true
            expect(new Card(suits[1], values[1]).isValidAfter(new Joker())).to.be.true
        })
    })

    describe("valid before", () => {
        it("should be valid", () => {
            expect(new Card(suits[0], values[0]).isValidBefore(new Card(suits[0], values[1]))).to.be.true
            expect(new Card(suits[0], values[values.length-2]).isValidBefore(new Card(suits[0], values[values.length-1]))).to.be.true
        })
        it("should not be valid", () => {
            expect(new Card(suits[0], values[0]).isValidBefore(new Card(suits[0], values[2]))).to.be.false
            expect(new Card(suits[0], values[values.length-3]).isValidBefore(new Card(suits[0], values[values.length-1]))).to.be.false
            expect(new Card(suits[0], values[0]).isValidBefore(new Card(suits[1], values[1]))).to.be.false
        })
        it("should handle ace", () => {
            expect(new Card(suits[0], "ace").isValidBefore(new Card(suits[0], "two"))).to.be.true
        })
        it("should handle joker", () => {
            expect(new Joker().isValidBefore(new Card(suits[0], values[0]))).to.be.true

            const j = new Joker()
            j.represents = new Card(suits[0], values[0])
            expect(j.isValidBefore(new Card(suits[0], values[1]))).to.be.true
            
            expect(new Joker().isValidBefore(new Card(suits[1], values[0]))).to.be.true
            expect(new Joker().isValidBefore(new Card(suits[1], values[1]))).to.be.true

            expect(new Card(suits[0], values[0]).isValidBefore(new Joker())).to.be.true
            expect(new Card(suits[0], values[1]).isValidBefore(new Joker())).to.be.true
            expect(new Card(suits[1], values[0]).isValidBefore(new Joker())).to.be.true
            expect(new Card(suits[1], values[1]).isValidBefore(new Joker())).to.be.true
        })
    })
})