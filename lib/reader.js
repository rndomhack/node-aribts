"use strict";

class Reader {
    constructor(buffer, position) {
        this.buffer = buffer;
        this.position = position || 0;
    }

    readBits(length) {
        var value = 0;

        while (length > 7) {
            let index = this.position >> 3;
            let shift = this.position & 0x07;
            let mask = Math.pow(2, 8 - shift) - 1;

            value <<= 8;
            value |= (this.buffer[index] & mask) << shift;
            value |= this.buffer[index + 1] >> (8 - shift);

            this.position += 8;
            length -= 8;
        }

        while (length > 0) {
            let index = this.position >> 3;
            let shift = this.position & 0x07 ^ 0x07;

            value <<= 1;
            value |= this.buffer[index] >> shift & 0x01;

            this.position++;
            length--;
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
        if (this.position + length > this.buffer.length << 3) {
            this.position += length;
            return null;
        }

        return this.readBits(length);
    }

    uimsbf(length) {
        if (this.position + length > this.buffer.length << 3) {
            this.position += length;
            return null;
        }

        return this.readBits(length);
    }

    tcimsbf(length) {
        if (this.position + length > this.buffer.length << 3) {
            this.position += length;
            return null;
        }

        return (-this.readBits(1) << length - 1) | this.readBits(length - 1);
    }

    rpchof(length) {
        if (this.position + length > this.buffer.length << 3) {
            this.position += length;
            return null;
        }

        var targetLen = length >> 3;
        var sourceLen = this.position >> 3;

        this.position += length;

        return new Buffer(this.buffer.slice(sourceLen, sourceLen + targetLen));
    }
}

module.exports = Reader;
