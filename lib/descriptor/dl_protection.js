"use strict";

const TsReader = require("../reader");

class TsDescriptorDlProtection {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.DL_system_ID = reader.uimsbf(8);
        reader.next(3);    // '111'
        objDescriptor.PID = reader.uimsbf(13);
        objDescriptor.encrypt_protocol_number = reader.uimsbf(8);
        objDescriptor.encrypt_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

module.exports = TsDescriptorDlProtection;
