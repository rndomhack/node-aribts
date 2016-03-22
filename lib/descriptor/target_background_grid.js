"use strict";

const TsReader = require("../reader");

class TsDescriptorTargetBackgroundGrid {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.horizontal_size = reader.uimsbf(14);
        objDescriptor.vertical_size = reader.uimsbf(14);
        objDescriptor.aspect_ratio_information = reader.uimsbf(4);

        return objDescriptor;
    }
}

module.exports = TsDescriptorTargetBackgroundGrid;
