"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorConditionalPlayback extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.conditional_playback_id = reader.uimsbf(16);
        reader.next(3);    // '111'
        objDescriptor.conditional_playback_PID = reader.uimsbf(13);

        return objDescriptor;
    }
}

module.exports = TsDescriptorConditionalPlayback;
