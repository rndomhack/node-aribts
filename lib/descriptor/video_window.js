"use strict";

const TsReader = require("../reader");

class TsDescriptorVideoWindow {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.horizontal_offset = reader.uimsbf(14);
        objDescriptor.vertical_offset = reader.uimsbf(14);
        objDescriptor.window_priority = reader.uimsbf(4);

        return objDescriptor;
    }
}

module.exports = TsDescriptorVideoWindow;
