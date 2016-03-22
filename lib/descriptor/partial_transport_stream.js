"use strict";

const TsReader = require("../reader");

class TsDescriptorPartialTransportStream {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

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
