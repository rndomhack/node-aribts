"use strict";

const TsReader = require("../reader");

class TsDescriptorMultiplexBufferUtilization {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.bound_valid_flag = reader.bslbf(1);
        objDescriptor.LTW_offset_lower_bound = reader.uimsbf(15);
        reader.next(1);    // reserved
        objDescriptor.LTW_offset_upper_bound = reader.uimsbf(14);

        return objDescriptor;
    }
}

module.exports = TsDescriptorMultiplexBufferUtilization;
