"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorDlProtection extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

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
