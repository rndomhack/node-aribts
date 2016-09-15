"use strict";

const stream = require("stream");

class TsWritableConnector extends stream.Readable {
    constructor() {
        super();

        this._callback = null;

        this.on("unpipe", this._read.bind(this));
    }

    _finish(callback) {
        this.push(null);

        this.emit("finish");

        callback();
    }

    _write(chunk, callback) {
        if (!this.push(chunk)) {
            this._callback = callback;
            return;
        }

        callback();
    }

    _read() {
        if (this._callback === null) return;

        const callback = this._callback;

        this._callback = null;

        callback();
    }
}

module.exports = TsWritableConnector;
