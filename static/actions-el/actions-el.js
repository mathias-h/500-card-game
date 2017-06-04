class ActionsEl extends HTMLElement {
    constructor() {
        super()

        this.handleError = this.handleError.bind(this)
        this.startAppend = this.startAppend.bind(this)
        this.startReplace = this.startReplace.bind(this)
    }

    connectedCallback() {
        this.innerHTML = `
            <button class="place" disabled>place</button>
            <button class="append" disabled>append</button>
            <button class="replace" disabled>repalce</button>
            <button class="draw-pile" disabled>draw pile</button>
            <button class="discard" disabled>discard</button>
        `

        this.place = this.querySelector(".place")
        this.append = this.querySelector(".append")
        this.replace = this.querySelector(".replace")
        this.drawPile = this.querySelector(".draw-pile")
        this.discard = this.querySelector(".discard")
    }

    handleError(fn) {
        return (result) => {
            if (!result.ok) alert(result.error)
            else {
                if (fn) fn(result)
            }
        }
    }

    setSocket(socket, playerId) {
        this.socket = socket

        socket.on("turn-changed", id => {
            if (playerId == id) {
                this.place.disabled = false
                this.append.disabled = false
                this.replace.disabled = false
                this.drawPile.disabled = false
                this.discard.disabled = false
            }
            else {
                this.place.disabled = true
                this.append.disabled = true
                this.replace.disabled = true
                this.drawPile.disabled = true
                this.discard.disabled = true
            }
        })

        this.place.addEventListener("click", _ => socket.emit("do-place", this.handleError()))
        this.append.addEventListener("click", _ => socket.emit("start-append", this.startAppend()))
        this.replace.addEventListener("click", _ => socket.emit("start-replace", this.startReplace()))
        this.drawPile.addEventListener("click", _ => socket.emit("do-draw-pile", this.handleError()))
        this.discard.addEventListener("click", _ => socket.emit("do-discard", this.handleError()))
    }

    startAppend() {
        return this.handleError(({ options }) => {
            const optionsEl = document.querySelector("options-el")
            const doAppend = option => this.socket.emit("do-append", option.option, this.handleError())

            optionsEl.setOptions(options, doAppend)
        })
    }

    startReplace() {
        return this.handleError(({ options }) => {
            const optionsEl = document.querySelector("options-el")
            const doReplace = option => this.socket.emit("do-replace", option.option, this.handleError())

            optionsEl.setOptions(options, doReplace)
        })
    }
}

customElements.define("actions-el", ActionsEl)