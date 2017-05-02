"use strict";

const stream = require("stream");

class TsWritableConnector extends stream.Readable {
    constructor() {
        super();

        let _callback = null;

        this._read = () => {
            if (_callback === null) return;

            const callback = _callback;

            _callback = null;

            callback();
        };

        this._write = (data, callback) => {
            if (!this.push(data)) {
                _callback = callback;
                return;
            }

            callback();
        };

        this._finish = callback => {
            this.push(null);

            this.emit("finish");

            callback();
        };

        this.on("unpipe", this._read.bind(this));
    }
}

module.exports = TsWritableConnector;
