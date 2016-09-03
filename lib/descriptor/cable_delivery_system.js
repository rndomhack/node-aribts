"use strict";

const TsReader = require("../reader");

class TsDescriptorCableDeliverySystem {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.frequency = reader.bslbf(32);
        reader.next(8);    // reserved_future_use
        objDescriptor.frame_type = reader.bslbf(4);
        objDescriptor.FEC_outer = reader.bslbf(4);
        objDescriptor.modulation = reader.bslbf(8);
        objDescriptor.symbol_rate = reader.bslbf(28);
        objDescriptor.FEC_inner = reader.bslbf(4);

        return objDescriptor;
    }
}

module.exports = TsDescriptorCableDeliverySystem;
