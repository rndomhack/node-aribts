"use strict";

const TsReader = require("../reader");
const TsCarouselDescriptorBase = require("./base");

class TsCarouselDescriptorInfo extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.text = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

module.exports = TsCarouselDescriptorInfo;
