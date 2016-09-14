"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorIbp extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.closed_gop_flag = reader.uimsbf(1);
        objDescriptor.identical_gop_flag = reader.uimsbf(1);
        objDescriptor.max_gop_length = reader.uimsbf(14);

        return objDescriptor;
    }
}

module.exports = TsDescriptorIbp;
