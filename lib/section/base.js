"use strict";

class TsSectionBase {
    constructor(buffer, pid) {
        this.buffer = buffer;
        this.pid = pid;
    }

    decode() {
        throw new Error("Not implemented");
    }

    encode() {
        throw new Error("Not implemented");
    }

    getBuffer() {
        return this.buffer;
    }

    getPacketDataBuffer() {
        return Buffer.concat([Buffer.alloc(1), this.buffer]);
    }

    getPid() {
        return this.pid;
    }

    getTableId() {
        return this.buffer[0];
    }

    getSectionSyntaxIndicator() {
        return this.buffer[1] >> 7;
    }

    getPrivateIndicator() {
        return (this.buffer[1] & 0x40) >> 6;
    }

    getSectionLength() {
        return (this.buffer[1] & 0x0F) << 8 | this.buffer[2];
    }
}

module.exports = TsSectionBase;
