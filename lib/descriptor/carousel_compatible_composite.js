"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");
const TsCarouselDescriptors = require("../carousel_descriptors");

class TsDescriptorCarouselCompatibleComposite extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.sub_descriptors = new TsCarouselDescriptors(reader.readBytesRaw(2 + objDescriptor.descriptor_length - (reader.position >> 3)));

        return objDescriptor;
    }
}

module.exports = TsDescriptorCarouselCompatibleComposite;
