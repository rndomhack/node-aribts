"use strict";

const TsReader = require("../reader");

class TsDescriptorAdvancedCableDeliverySystem {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.extention_descriptor_tag = reader.uimsbf(8);
        objDescriptor.PLP_ID = reader.uimsbf(8);
        objDescriptor.effective_symbol_length = reader.uimsbf(3);
        objDescriptor.guard_interval = reader.uimsbf(3);
        objDescriptor.bundled_channel = reader.uimsbf(8);
        reader.next(2);    // reserved_future_use

        objDescriptor.frequencies = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let frequency = {};

            frequency.data_slice_id = reader.uimsbf(8);
            frequency.tune_freq = reader.uimsbf(32);
            frequency.tune_freq_type = reader.uimsbf(2);
            frequency.FEC_outer = reader.uimsbf(4);
            frequency.modulation = reader.uimsbf(8);
            frequency.FEC_inner = reader.uimsbf(4);
            reader.next(6);    // reserved_future_use

            objDescriptor.frequencies.push(frequency);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorAdvancedCableDeliverySystem;
