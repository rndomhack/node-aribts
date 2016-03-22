"use strict";

const TsReader = require("../reader");

class TsDescriptorNearVideoOnDemandReference {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.NVOD_references = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let NVOD_reference = {};

            NVOD_reference.transport_stream_id = reader.uimsbf(16);
            NVOD_reference.original_network_id = reader.uimsbf(16);
            NVOD_reference.service_id = reader.uimsbf(16);

            objDescriptor.NVOD_references.push(NVOD_reference);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorNearVideoOnDemandReference;
