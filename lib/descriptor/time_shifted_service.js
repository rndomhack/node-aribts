"use strict";

const TsReader = require("../reader");

class TsDescriptorTimeShiftedService {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reference_service_id = reader.uimsbf(16);

        return objDescriptor;
    }
}

module.exports = TsDescriptorTimeShiftedService;
