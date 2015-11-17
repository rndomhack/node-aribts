"use strict";

const TsReader = require("../reader");

class TsDescriptorHybridInformation {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.has_location = reader.bslbf(1);
        objDescriptor.location_type = reader.bslbf(1);
        objDescriptor.format = reader.uimsbf(4);
        objDescriptor.reserved = reader.bslbf(2);

        if (objDescriptor.has_location) {
            if (objDescriptor.location_type === 0) {
                objDescriptor.component_tag = reader.uimsbf(8);
                objDescriptor.module_id = reader.uimsbf(16);
            } else {
                objDescriptor.URL_length = reader.uimsbf(8);
                objDescriptor.URL_byte = reader.readBytes(objDescriptor.URL_length);
            }
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorHybridInformation;
