"use strict";

const crc32Table = require("./crc32_table");

class TsCrc32 {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let crc = -1;

        for (let byte of this.buffer) {
            crc = (crc << 8) ^ crc32Table[(crc >>> 24) ^ byte];
        }

        return crc;
    }

    decodeBuffer() {
        let buffer = new Buffer(4).fill(0x00);

        buffer.writeInt32BE(this.decode(), 0);

        return buffer;
    }
}

module.exports = TsCrc32;
