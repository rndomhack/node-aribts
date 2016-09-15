"use strict";

const stream = require("stream");

class TsReadableConnector extends stream.Writable {
    constructor() {
        super();

        this._pipes = [];

        this._processing = 0;
        this._callback = null;

        this._completeCallback = this._completeCallback.bind(this);

        this.on("finish", this._finish.bind(this));
    }

    pipe(pipe) {
        if (this._pipes.includes(pipe)) return false;

        this._pipes = this._pipes.slice();
        this._pipes.push(pipe);

        pipe.emit("pipe", this);

        return true;
    }

    unpipe(pipe) {
        if (!this._pipes.includes(pipe)) return false;

        this._pipes = this._pipes.slice();
        this._pipes.splice(this._pipes.indexOf(pipe), 1);

        pipe.emit("unpipe", this);

        return true;
    }

    _completeCallback() {
        if (--this._processing !== 0) return;

        const callback = this._callback;

        this._callback = null;

        callback();
    }

    _finish() {
        const pipes = this._pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i]._finish(this._completeCallback);
        }

        this._processing += pipes.length;

        if (this._processing !== 0) {
            this._callback = () => {
                // Nothing
            };
            return;
        }
    }

    _write(chunk, encoding, callback) {
        const pipes = this._pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i]._write(chunk, this._completeCallback);
        }

        this._processing += pipes.length;

        if (this._processing !== 0) {
            this._callback = callback;
            return;
        }

        callback();
    }
}

module.exports = TsReadableConnector;
