"use strict";

const stream = require("stream");

class TsWritableConnector extends stream.Readable {
    constructor() {
        super();

        let _callback = null;

        this._finish = callback => {
            this.push(null);

            this.emit("finish");

            callback();
        };

        this._write = (chunk, callback) => {
            if (!this.push(chunk)) {
                _callback = callback;
                return;
            }

            callback();
        };

        this._read = () => {
            if (_callback === null) return;

            const callback = _callback;

            _callback = null;

            callback();
        };

        this.on("unpipe", this._read.bind(this));
    }
}

module.exports = TsWritableConnector;
