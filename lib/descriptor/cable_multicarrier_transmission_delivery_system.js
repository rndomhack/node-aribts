"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorCableMulticarrierTransmissionDeliverySystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.frequency = reader.bslbf(32);
        reader.next(8);    // reserved_future_use
        objDescriptor.frame_type = reader.bslbf(4);
        objDescriptor.FEC_outer = reader.bslbf(4);
        objDescriptor.modulation = reader.bslbf(8);
        objDescriptor.symbol_rate = reader.bslbf(28);
        objDescriptor.FEC_inner = reader.bslbf(4);
        objDescriptor.carrier_group_id = reader.bslbf(8);

        return objDescriptor;
    }
}

module.exports = TsDescriptorCableMulticarrierTransmissionDeliverySystem;
