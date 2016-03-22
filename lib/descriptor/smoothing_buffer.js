"use strict";

const TsReader = require("../reader");

class TsDescriptorSmoothingBuffer {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

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
