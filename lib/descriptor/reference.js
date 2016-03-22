"use strict";

const TsReader = require("../reader");

class TsDescriptorReference {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.information_provider_id = reader.uimsbf(16);
        objDescriptor.event_relation_id = reader.uimsbf(16);
        objDescriptor.references = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let reference = {};

            reference.reference_node_id = reader.uimsbf(16);
            reference.reference_number = reader.uimsbf(8);
            reference.last_reference_number = reader.uimsbf(8);

            objDescriptor.references.push(reference);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorReference;
