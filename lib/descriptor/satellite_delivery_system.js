"use strict";

const TsReader = require("../reader");

class TsDescriptorSatelliteDeliverySystem {
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
        objDescriptor.orbital_position = reader.uimsbf(16);
        objDescriptor.west_east_flag = reader.uimsbf(1);
        objDescriptor.polarisation = reader.uimsbf(2);
        objDescriptor.modulation = reader.uimsbf(5);
        objDescriptor.symbol_rate = reader.uimsbf(28);
        objDescriptor.FEC_inner = reader.uimsbf(4);

        return objDescriptor;
    }
}

module.exports = TsDescriptorSatelliteDeliverySystem;
