"use strict";

const stream = require("stream");

class TsReadableConnector extends stream.Writable {
    constructor() {
        super();

        this.pipes = [];
        this.pause = 0;

        this.pauseCb = null;
        this.resumeCb = this._resume.bind(this);

        this.on("finish", this.end.bind(this));
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

    end() {
        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].end();
        }
    }

    _resume() {
        if (--this.pause !== 0) return;

        const pauseCb = this.pauseCb;

        this.pauseCb = null;

        pauseCb();
    }

    _write(chunk, encoding, callback) {
        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            this.pause += pipes[i].write(chunk, this.resumeCb);
        }

        if (this.pause === 0) {
            callback();
        } else {
            this.pauseCb = callback;
        }
    }
}

module.exports = TsReadableConnector;
