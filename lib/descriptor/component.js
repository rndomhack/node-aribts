"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorComponent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(4);    // reserved_future_use
        objDescriptor.stream_content = reader.uimsbf(4);
        objDescriptor.component_type = reader.uimsbf(8);
        objDescriptor.component_tag = reader.uimsbf(8);
        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.text = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

module.exports = TsDescriptorComponent;
