"use strict";

const TsReader = require("../reader");

class TsDescriptorContent {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.contents = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let content = {};

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
