"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorService extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.service_type = reader.uimsbf(8);
        objDescriptor.service_provider_name_length = reader.uimsbf(8);
        objDescriptor.service_provider_name = reader.readBytes(objDescriptor.service_provider_name_length);
        objDescriptor.service_name_length = reader.uimsbf(8);
        objDescriptor.service_name = reader.readBytes(objDescriptor.service_name_length);

        return objDescriptor;
    }
}

module.exports = TsDescriptorService;
