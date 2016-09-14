"use strict";

const TsReader = require("../reader");
const TsCarouselDescriptorBase = require("./base");

class TsCarouselDescriptorCrc32 extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CRC_32 = reader.readBytes(4);

        return objDescriptor;
    }
}

module.exports = TsCarouselDescriptorCrc32;
