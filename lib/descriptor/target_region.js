"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorTargetRegion extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

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
