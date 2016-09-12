"use strict";

const stream = require("stream");

class TsWritableConnector extends stream.Readable {
    constructor() {
        super();

        this.pipes = [];
    }

    end() {
        this.finish();

        this.emit("finish");
    }

    write(data) {
        this.process(data);
    }

    process(chunk) {
        this.push(chunk);
    }

    finish() {
        this.push(null);
    }

    _read() {
        // Nothing
    }
}

module.exports = TsWritableConnector;
