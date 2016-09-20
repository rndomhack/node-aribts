"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorNearVideoOnDemandReference extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.NVOD_references = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const NVOD_reference = {};

            NVOD_reference.transport_stream_id = reader.uimsbf(16);
            NVOD_reference.original_network_id = reader.uimsbf(16);
            NVOD_reference.service_id = reader.uimsbf(16);

            objDescriptor.NVOD_references.push(NVOD_reference);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorNearVideoOnDemandReference;
