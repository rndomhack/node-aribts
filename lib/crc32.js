"use strict";

const crc32Table = require("./crc32_table");

class TsCrc32 {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let crc = -1;

        for (let i = 0, l = this.buffer.length; i < l; i++) {
            crc = (crc << 8) ^ crc32Table[(crc >>> 24) ^ this.buffer[i]];
        }

        return crc;
    }

    decodeBuffer() {
        const buffer = Buffer.alloc(4);

        buffer.writeInt32BE(this.decode(), 0);

        return buffer;
    }
}

module.exports = TsCrc32;
