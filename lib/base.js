"use strict";

const EventEmitter3 = require("eventemitter3");

class TsBase extends EventEmitter3 {
    constructor() {
        super();

        this.pipes = [];
        this.queue = [];

        this.dataRequired = false;
    }

    on(_event, fn, context) {
        super.on(_event, fn, context);

        if (_event === "data") {
            this._checkDataListener();
        }

        return this;
    }

    once(_event, fn, context) {
        super.once(_event, fn, context);

        if (_event === "data") {
            this._checkDataListener();
            super.once("data", this._checkDataListener.bind(this));
        }

        return this;
    }

    off(_event, fn, context, once) {
        return this.removeListener(_event, fn, context, once);
    }

    addListener(_event, fn, context) {
        return this.on(_event, fn, context);
    }

    removeListener(_event, fn, context, once) {
        super.removeListener(_event, fn, context, once);

        if (_event === "data") {
            this._checkDataListener();
        }

        return this;
    }

    removeAllListeners(_event) {
        super.removeAllListeners(_event);
        this._checkDataListener();

        return this;
    }

    pipe(pipe) {
        if (this.pipes.includes(pipe)) return false;

        this.pipes = this.pipes.slice();
        this.pipes.push(pipe);

        pipe.emit("pipe", this);

        return true;
    }

    unpipe(pipe) {
        if (!this.pipes.includes(pipe)) return false;

        this.pipes = this.pipes.slice();
        this.pipes.splice(this.pipes.indexOf(pipe), 1);

        pipe.emit("unpipe", this);

        return true;
    }

    push(data) {
        this.queue.push(data);
    }

    end() {
        this._finish();

        for (let i = 0, l = this.queue.length; i < l; i++) {
            if (this.dataRequired) {
                this.emit("data", this.queue[i]);
            }

            const pipes = this.pipes;

            for (let j = 0, l2 = pipes.length; j < l2; j++) {
                pipes[j].write(this.queue[i]);
            }
        }

        this.queue = [];

        this.emit("finish");

        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].end();
        }
    }

    write(data, callback) {
        this._process(data);

        let pause = 0;

        for (let i = 0, l = this.queue.length; i < l; i++) {
            if (this.dataRequired) {
                this.emit("data", this.queue[i]);
            }

            const pipes = this.pipes;

            for (let j = 0, l2 = pipes.length; j < l2; j++) {
                pause += pipes[j].write(this.queue[i], callback);
            }
        }

        this.queue = [];

        return pause;
    }

    _checkDataListener() {
        if (this.listeners("data", true)) {
            this.dataRequired = true;
        } else {
            this.dataRequired = false;
        }
    }

    _process() {
        // Nothing
    }

    _finish() {
        // Nothing
    }
}

module.exports = TsBase;
