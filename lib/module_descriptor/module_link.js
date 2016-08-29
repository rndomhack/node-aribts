"use strict";

const TsReader = require("../reader");

class TsModuleDescriptorModuleLink {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.position = reader.uimsbf(8);
        objDescriptor.moduleId = reader.uimsbf(16);

        return objDescriptor;
    }
}

module.exports = TsModuleDescriptorModuleLink;
