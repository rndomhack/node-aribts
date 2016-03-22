"use strict";

const TsReader = require("../reader");

class TsDescriptorHierarchicalTransmission {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(7);    // reserved_future_use
        objDescriptor.quality_level = reader.bslbf(1);
        reader.next(3);    // reserved_future_use
        objDescriptor.reference_PID = reader.uimsbf(13);

        return objDescriptor;
    }
}

module.exports = TsDescriptorHierarchicalTransmission;
