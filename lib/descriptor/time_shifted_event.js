"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorTimeShiftedEvent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reference_service_id = reader.uimsbf(16);
        objDescriptor.reference_event_id = reader.uimsbf(16);

        return objDescriptor;
    }
}

module.exports = TsDescriptorTimeShiftedEvent;
