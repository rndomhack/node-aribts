"use strict";

class TsSectionBase {
    constructor(buffer, pid) {
        this._buffer = buffer;
        this._pid = pid;
    }

    decode() {
        throw new Error("Not implemented");
    }

    encode() {
        throw new Error("Not implemented");
    }

    getBuffer() {
        return this._buffer;
    }

    getPacketDataBuffer() {
        return Buffer.concat([Buffer.alloc(1), this._buffer]);
    }

    getPid() {
        return this._pid;
    }

    getTableId() {
        return this._buffer[0];
    }

    getSectionSyntaxIndicator() {
        return this._buffer[1] >> 7;
    }

    getPrivateIndicator() {
        return (this._buffer[1] & 0x40) >> 6;
    }

    getSectionLength() {
        return (this._buffer[1] & 0x0F) << 8 | this._buffer[2];
    }
}

module.exports = TsSectionBase;
