"use strict";

const TsReader = require("../reader");

class TsDescriptorPrivateDataIndicator {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.private_data_indicator = reader.uimsbf(32);

        return objDescriptor;
    }
}

module.exports = TsDescriptorPrivateDataIndicator;
