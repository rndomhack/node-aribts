"use strict";

const stream = require("stream");

class TsReadableConnector extends stream.Writable {
    constructor() {
        super();

        this.pipes = [];
        this.pause = 0;

        this.callback = null;
        this.resumeCb = this._resume.bind(this);

        this.on("finish", this._finish.bind(this));
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

    _resume() {
        if (--this.pause !== 0) return;

        const callback = this.callback;

        this.callback = null;

        callback();
    }

    _write(chunk, encoding, callback) {
        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            this.pause += pipes[i].write(chunk, this.resumeCb);
        }

        if (this.pause === 0) {
            callback();
        } else {
            this.callback = callback;
        }
    }

    _finish() {
        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].end();
        }
    }
}

module.exports = TsReadableConnector;
