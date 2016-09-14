"use strict";

class TsDescriptorBase {
    constructor(buffer) {
        this.buffer = buffer;
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

    getDescriptorTag() {
        return this.buffer[0];
    }

    getDescriptorLength() {
        return this.buffer[1];
    }
}

module.exports = TsDescriptorBase;
