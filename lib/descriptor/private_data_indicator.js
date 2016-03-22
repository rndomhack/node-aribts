"use strict";

const TsReader = require("../reader");

class TsDescriptorPrivateDataIndicator {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.private_data_indicator = reader.readBytes(4);

        return objDescriptor;
    }
}

module.exports = TsDescriptorPrivateDataIndicator;
