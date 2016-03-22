"use strict";

const TsReader = require("../reader");

class TsDescriptorTargetRegion {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.region_spec_type = reader.uimsbf(8);
        objDescriptor.target_region_spec = {};

        if (objDescriptor.region_spec_type === 0x01) {
            objDescriptor.target_region_spec.prefecture_bitmap = reader.readBytes(7);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorTargetRegion;
