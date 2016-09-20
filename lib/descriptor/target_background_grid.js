"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorTargetBackgroundGrid extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.horizontal_size = reader.uimsbf(14);
        objDescriptor.vertical_size = reader.uimsbf(14);
        objDescriptor.aspect_ratio_information = reader.uimsbf(4);

        return objDescriptor;
    }
}

module.exports = TsDescriptorTargetBackgroundGrid;
