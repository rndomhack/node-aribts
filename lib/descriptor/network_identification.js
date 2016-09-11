"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorNetworkIdentification extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.country_code = reader.readBytes(3);
        objDescriptor.media_type = reader.bslbf(16);
        objDescriptor.network_id = reader.uimsbf(16);
        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

module.exports = TsDescriptorNetworkIdentification;
