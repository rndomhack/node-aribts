"use strict";

const crc32Table = require("./crc32_table");

class TsCrc32 {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var crc = -1;

        for (let i = 0; i < this.buffer.length; i++) {
            crc = (crc << 8) ^ crc32Table[(crc >>> 24) ^ this.buffer[i]];
        }

        return crc;
    }

    decodeBuffer() {
        var buffer = new Buffer(4).fill(0x00);

        buffer.writeInt32BE(this.decode(), 0);

        return buffer;
    }
}

module.exports = TsCrc32;
