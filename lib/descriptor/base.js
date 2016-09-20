"use strict";

class TsDescriptorBase {
    constructor(buffer) {
        this._buffer = buffer;
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

    getDescriptorTag() {
        return this._buffer[0];
    }

    getDescriptorLength() {
        return this._buffer[1];
    }
}

module.exports = TsDescriptorBase;
