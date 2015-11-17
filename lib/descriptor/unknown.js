"use strict";

const TsReader = require("../reader");

class TsDescriptorUnknown {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.descriptor = reader.readBytes(objDescriptor.descriptor_length);

        return objDescriptor;
    }
}

module.exports = TsDescriptorUnknown;
