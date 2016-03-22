"use strict";

const TsReader = require("../reader");

class TsDescriptorIbp {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.closed_gop_flag = reader.uimsbf(1);
        objDescriptor.identical_gop_flag = reader.uimsbf(1);
        objDescriptor.max_gop_length = reader.uimsbf(14);

        return objDescriptor;
    }
}

module.exports = TsDescriptorIbp;
