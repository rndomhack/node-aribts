"use strict";

const TsReader = require("../reader");

class TsDescriptorCableMulticarrierTransmissionDeliverySystem {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.frequency = reader.uimsbf(32);
        reader.next(8);    // reserved_future_use
        objDescriptor.multiplex_frame_format_number = reader.uimsbf(4);
        objDescriptor.FEC_outer = reader.uimsbf(4);
        objDescriptor.modulation = reader.uimsbf(8);
        objDescriptor.symbol_rate = reader.uimsbf(28);
        objDescriptor.FEC_inner = reader.uimsbf(4);
        objDescriptor.carrier_group_id = reader.uimsbf(8);

        return objDescriptor;
    }
}

module.exports = TsDescriptorCableMulticarrierTransmissionDeliverySystem;
