"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorVideoDecodeControl extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.still_picture_flag = reader.bslbf(1);
        objDescriptor.sequence_end_code_flag = reader.bslbf(1);
        objDescriptor.video_encode_format = reader.bslbf(4);
        reader.next(2);    // reserved_future_use

        return objDescriptor;
    }
}

module.exports = TsDescriptorVideoDecodeControl;
