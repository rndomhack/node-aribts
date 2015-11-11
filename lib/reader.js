"use strict";

class Reader {
    constructor(buffer, position) {
        this.buffer = buffer;
        this.position = position || 0;
    }

    readBits(length) {
        var value = 0;

        for (let i = 0; i < length; i++, this.position++) {
            let index = this.position >> 3;
            let shift = this.position & 0b111 ^ 0b111;
            var offset = length - i - 1;

            value |= (this.buffer[index] >> shift & 0b1) << offset;
        }

        return value;
    }

    next(length) {
        this.position += length;
    }

    previous(length) {
        this.position -= length;
    }

    bslbf(length) {
        return this.readBits(length);
    }

    uimsbf(length) {
        return this.readBits(length);
    }

    tcimsbf(length) {
        return (-this.readBits(1) << length - 1) | this.readBits(length - 1);
    }

    rpchof(length) {
        var targetLen = length >> 3;
        var sourceLen = this.position >> 3;

        return new Buffer(this.buffer.slice(sourceLen, sourceLen + targetLen));
    }
}

module.exports = Reader;
