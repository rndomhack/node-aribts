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
}

module.exports = TsCrc32;
