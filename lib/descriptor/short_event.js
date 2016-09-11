"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorShortEvent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.event_name_length = reader.uimsbf(8);
        objDescriptor.event_name = reader.readBytes(objDescriptor.event_name_length);
        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}

module.exports = TsDescriptorShortEvent;
