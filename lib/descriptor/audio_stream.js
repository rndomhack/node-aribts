"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorAudioStream extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.free_format_flag = reader.bslbf(1);
        objDescriptor.ID = reader.bslbf(1);
        objDescriptor.layer = reader.bslbf(2);
        objDescriptor.variable_rate_audio_indicator = reader.bslbf(1);
        reader.next(3);    // reserved

        return objDescriptor;
    }
}

module.exports = TsDescriptorAudioStream;
