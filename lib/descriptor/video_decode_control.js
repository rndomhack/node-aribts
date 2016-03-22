"use strict";

const TsReader = require("../reader");

class TsDescriptorVideoDecodeControl {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

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
