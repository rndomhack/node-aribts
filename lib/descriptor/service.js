"use strict";

const TsReader = require("../reader");

class TsDescriptorService {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.service_type = reader.uimsbf(8);
        objDescriptor.service_provider_name_length = reader.uimsbf(8);
        objDescriptor.service_provider_name_char = reader.readBytes(objDescriptor.service_provider_name_length);
        objDescriptor.service_name_length = reader.uimsbf(8);
        objDescriptor.service_name_char = reader.readBytes(objDescriptor.service_name_lengt);

        return objDescriptor;
    }
}

module.exports = TsDescriptorService;
