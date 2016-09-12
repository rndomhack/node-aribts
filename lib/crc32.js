"use strict";

const crc32Table = require("./crc32_table");

class TsCrc32 {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        return TsCrc32.calc(this.buffer);
    }

    decodeBuffer() {
        return TsCrc32.calcToBuffer(this.buffer);
    }

    static calc(buffer) {
        let crc = -1;

        for (let i = 0, l = buffer.length; i < l; i++) {
            crc = (crc << 8) ^ crc32Table[(crc >>> 24) ^ buffer[i]];
        }

        return crc;
    }

    static calcToBuffer(buffer) {
        let result = Buffer.alloc(4);

        result.writeInt32BE(TsCrc32.calc(buffer), 0);

        return result;
    }
}

module.exports = TsCrc32;
