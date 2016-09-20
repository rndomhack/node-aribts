"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorDataContent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.data_component_id = reader.uimsbf(16);
        objDescriptor.entry_component = reader.uimsbf(8);
        objDescriptor.selector_length = reader.uimsbf(8);
        objDescriptor.selector = reader.readBytes(objDescriptor.selector_length);
        objDescriptor.num_of_component_ref = reader.uimsbf(8);
        objDescriptor.component_ref = reader.readBytes(objDescriptor.num_of_component_ref);
        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}

module.exports = TsDescriptorDataContent;
