"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorVideoWindow extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.horizontal_offset = reader.uimsbf(14);
        objDescriptor.vertical_offset = reader.uimsbf(14);
        objDescriptor.window_priority = reader.uimsbf(4);

        return objDescriptor;
    }
}

module.exports = TsDescriptorVideoWindow;
