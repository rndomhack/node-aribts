"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorCaIdentifier extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);
        objDescriptor.CAs = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            const CA_identifier = {};

            CA_identifier.CA_system_id = reader.uimsbf(16);

            objDescriptor.CAs.push(CA_identifier);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCaIdentifier;
