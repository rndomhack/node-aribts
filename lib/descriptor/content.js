"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorContent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.contents = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const content = {};

            content.content_nibble_level_1 = reader.uimsbf(4);
            content.content_nibble_level_2 = reader.uimsbf(4);
            content.user_nibble_1 = reader.uimsbf(4);
            content.user_nibble_2 = reader.uimsbf(4);

            objDescriptor.contents.push(content);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorContent;
