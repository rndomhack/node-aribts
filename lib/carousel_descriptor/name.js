"use strict";

const TsReader = require("../reader");
const TsCarouselDescriptorBase = require("./base");

class TsCarouselDescriptorName extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.text = reader.readBytes(objDescriptor.descriptor_length);

        return objDescriptor;
    }
}

module.exports = TsCarouselDescriptorName;
