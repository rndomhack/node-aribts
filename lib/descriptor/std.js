"use strict";

const TsReader = require("../reader");

class TsDescriptorStd {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(7);    // reserved
        objDescriptor.leak_valid_flag = reader.bslbf(1);

        return objDescriptor;
    }
}

module.exports = TsDescriptorStd;
