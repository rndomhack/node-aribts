"use strict";

const TsReader = require("../reader");

class TsDescriptorSiParameter {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.parameter_version = reader.uimsbf(8);
        objDescriptor.update_time = reader.uimsbf(16);

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            objDescriptor.table_id = reader.uimsbf(8);
            objDescriptor.table_description_length = reader.uimsbf(8);
            objDescriptor.table_description_byte = reader.readBytes(objDescriptor.table_description_length);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorSiParameter;
