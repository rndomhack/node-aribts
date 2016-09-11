"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorShortNodeInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_language_code = reader.bslbf(24);
        objDescriptor.node_name_length = reader.uimsbf(8);
        objDescriptor.node_name = reader.readBytes(objDescriptor.node_name_length);
        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}

module.exports = TsDescriptorShortNodeInformation;
