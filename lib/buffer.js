"use strict";

class TsBuffer {
    constructor() {
        this.chunks = [];
        this.length = 0;
    }

    add(chunk) {
        this.chunks.push(chunk);
        this.length += chunk.length;
    }

    reset() {
        this.chunks.length = 0;
        this.length = 0;
    }

    concat() {
        return Buffer.concat(this.chunks);
    }
}

module.exports = TsBuffer;
