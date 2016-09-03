"use strict";

const TsReader = require("../reader");

class TsDescriptorSystemManagement {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.system_management_id = reader.uimsbf(16);
        objDescriptor.additional_identification_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

module.exports = TsDescriptorSystemManagement;
