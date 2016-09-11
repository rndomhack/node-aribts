"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorSiParameter extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.parameter_version = reader.uimsbf(8);
        objDescriptor.update_time = reader.uimsbf(16);

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            objDescriptor.table_id = reader.uimsbf(8);
            objDescriptor.table_description_length = reader.uimsbf(8);
            objDescriptor.table_description = reader.readBytes(objDescriptor.table_description_length);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorSiParameter;
