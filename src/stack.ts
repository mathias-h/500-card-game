class Node<T> {
    next: Node<T>

    constructor(public value: T) {}
}

export class Stack<T> {
    private _size: number = 0
    get size() { return this._size }
    get isEmpty() { return this.size == 0 }

    private head: Node<T> | null

    constructor(values?: T[]) {
        if (values) {
            for (const value of values) {
                this.push(value)
            }
        }
    }

    push(value: T) {
        const newNode = new Node<T>(value)

        this._size += 1

        if (this.head == null) {
            this.head = newNode
        }
        else {
            newNode.next = this.head
            this.head = newNode
        }
    }
    
    pop() {
        if (this.head == null) throw new Error("there are no items to pop")

        this._size -= 1

        const value = this.head.value

        this.head = this.head.next

        return value
    }

    peek() {
        if (this.head == null) return null

        return this.head.value
    }

    clear() {
        this.head = null
        this._size = 0
    }
}