"use strict";

const TsReader = require("../reader");
const TsCarouselDescriptorBase = require("./base");

class TsCarouselDescriptorModuleLink extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.position = reader.uimsbf(8);
        objDescriptor.moduleId = reader.uimsbf(16);

        return objDescriptor;
    }
}

module.exports = TsCarouselDescriptorModuleLink;
