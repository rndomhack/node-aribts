"use strict";

const stream = require("stream");

class TsWritableConnector extends stream.Readable {
    constructor() {
        super();

        this.flowing = true;
        this.callbacks = [];

        this.on("unpipe", this._read.bind(this));
    }

    end() {
        this.push(null);

        this.emit("finish");
    }

    write(chunk, callback) {
        if (callback === void 0) {
            return this.push(chunk);
        }

        if (this.push(chunk)) return 0;

        this.flowing = false;

        this.callbacks.push(callback);

        return 1;
    }

    _read() {
        if (this.flowing) return;

        const callbacks = this.callbacks;

        this.flowing = true;
        this.callbacks = [];

        for (let i = 0, l = callbacks.length; i < l; i++) {
            callbacks[i]();
        }
    }
}

module.exports = TsWritableConnector;
