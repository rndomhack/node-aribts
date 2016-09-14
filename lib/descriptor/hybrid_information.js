"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorHybridInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.has_location = reader.bslbf(1);
        objDescriptor.location_type = reader.bslbf(1);
        objDescriptor.format = reader.uimsbf(4);
        reader.next(2);    // reserved

        if (objDescriptor.has_location) {
            if (objDescriptor.location_type === 0) {
                objDescriptor.component_tag = reader.uimsbf(8);
                objDescriptor.module_id = reader.uimsbf(16);
            } else {
                objDescriptor.URL_length = reader.uimsbf(8);
                objDescriptor.URL = reader.readBytes(objDescriptor.URL_length);
            }
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorHybridInformation;
