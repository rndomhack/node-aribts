"use strict";

const TsReader = require("../reader");

class TsDescriptorStreamIdentifier {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.component_tag = reader.uimsbf(8);

        return objDescriptor;
    }
}

module.exports = TsDescriptorStreamIdentifier;
