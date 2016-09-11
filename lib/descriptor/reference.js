"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorReference extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.information_provider_id = reader.uimsbf(16);
        objDescriptor.event_relation_id = reader.uimsbf(16);
        objDescriptor.references = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            const reference = {};

            reference.reference_node_id = reader.uimsbf(16);
            reference.reference_number = reader.uimsbf(8);
            reference.last_reference_number = reader.uimsbf(8);

            objDescriptor.references.push(reference);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorReference;
