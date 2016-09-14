"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorPartialTransportStream extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(2);    // reserved_future_use
        objDescriptor.peak_rate = reader.uimsbf(22);
        reader.next(2);    // reserved_future_use
        objDescriptor.minimum_overall_smoothing_rate = reader.uimsbf(22);
        reader.next(2);    // reserved_future_use
        objDescriptor.maximum_overall_smoothing_buffer = reader.uimsbf(14);

        return objDescriptor;
    }
}

module.exports = TsDescriptorPartialTransportStream;
