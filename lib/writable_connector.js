"use strict";

const stream = require("stream");

class TsWritableConnector extends stream.Readable {
    constructor() {
        super();

        this.pipes = [];
    }

    end() {
        this.finish();
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
