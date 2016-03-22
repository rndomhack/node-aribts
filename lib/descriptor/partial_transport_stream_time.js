"use strict";

const TsReader = require("../reader");

class TsDescriptorPartialTransportStreamTime {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.event_version_number = reader.uimsbf(8);
        objDescriptor.event_start_time = reader.readBytes(5);
        objDescriptor.duration = reader.readBytes(3);
        objDescriptor.offset = reader.readBytes(3);
        reader.next(5);    // reserved
        objDescriptor.offset_flag = reader.bslbf(1);
        objDescriptor.other_descriptor_status = reader.bslbf(1);
        objDescriptor.jst_time_flag = reader.bslbf(1);

        if (objDescriptor.jst_time_flag === 1) {
            objDescriptor.jst_time = reader.readBytes(5);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorPartialTransportStreamTime;
