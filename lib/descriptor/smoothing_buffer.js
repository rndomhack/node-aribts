"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorSmoothingBuffer extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(2);    // reserved
        objDescriptor.sb_leak_rate = reader.uimsbf(22);
        reader.next(2);    // reserved
        objDescriptor.sb_size = reader.uimsbf(22);

        return objDescriptor;
    }
}

module.exports = TsDescriptorSmoothingBuffer;
