import { Stack } from "../src/stack"
import { expect } from "chai"

describe("Stack", () => {
    let stack: Stack<number>

    beforeEach(() => {
        stack = new Stack<number>()
    })

    it("push", () => {
        expect(stack.size).to.eq(0)

        stack.push(1)

        expect(stack.peek()).to.eq(1)
        expect(stack.size).to.eq(1)
    })

    it("pop", () => {
        stack.push(1)
        expect(stack.size).to.eq(1)

        expect(stack.pop()).to.eq(1)

        expect(stack.size).to.eq(0)

        expect(() => stack.pop()).to.throw()
    })

    it("should peek item", () => {
        expect(stack.peek()).to.eq(null)

        stack.push(1)

        expect(stack.peek()).to.eq(1)
        expect(stack.peek()).to.eq(1)
    })

    it("size", () => {
        expect(stack.size).to.eq(0)

        stack.push(1)

        expect(stack.size).to.eq(1)

        stack.push(1)

        expect(stack.size).to.eq(2)

        stack.pop()

        expect(stack.size).to.eq(1)

        stack.pop()

        expect(stack.size).to.eq(0)
    })

    it("empty", () => {
        expect(stack.isEmpty).to.be.true

        stack.push(1)

        expect(stack.isEmpty).to.be.false

        stack.pop()

        expect(stack.isEmpty).to.be.true
    })

    it("clear", () => {
        stack.push(1)
        stack.push(2)
        stack.push(3)

        expect(stack.size).to.eq(3)
        stack.clear()
        expect(() =>stack.pop()).to.throw()
        expect(stack.size).to.eq(0)
    })
})