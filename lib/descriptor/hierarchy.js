"use strict";

const TsReader = require("../reader");

class TsDescriptorHierarchy {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(1);    // reserved
        objDescriptor.temporal_scalability_flag = reader.bslbf(1);
        objDescriptor.spatial_scalability_flag = reader.bslbf(1);
        objDescriptor.quality_scalability_flag = reader.bslbf(1);
        objDescriptor.hierarchy_type = reader.uimsbf(4);
        reader.next(2);    // reserved
        objDescriptor.hierarchy_layer_index = reader.uimsbf(6);
        objDescriptor.tref_present_flag = reader.bslbf(1);
        reader.next(1);    // reserved
        objDescriptor.hierarchy_embedded_layer_index = reader.uimsbf(6);
        reader.next(2);    // reserved
        objDescriptor.hierarchy_channel = reader.uimsbf(6);

        return objDescriptor;
    }
}

module.exports = TsDescriptorHierarchy;
