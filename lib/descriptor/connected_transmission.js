"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorConnectedTransmission extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.connected_transmission_group_id = reader.uimsbf(16);
        objDescriptor.segment_type = reader.bslbf(2);
        objDescriptor.modulation_type_A = reader.bslbf(2);
        objDescriptor.modulation_type_B = reader.bslbf(2);
        objDescriptor.modulation_type_C = reader.bslbf(2);
        objDescriptor.additional_connected_transmission_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

module.exports = TsDescriptorConnectedTransmission;
