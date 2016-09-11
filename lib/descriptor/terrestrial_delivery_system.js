"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorTerrestrialDeliverySystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.area_code = reader.bslbf(12);
        objDescriptor.guard_interval = reader.bslbf(2);
        objDescriptor.transmission_mode = reader.bslbf(2);
        objDescriptor.frequencies = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            const frequency = {};

            frequency.frequency = reader.uimsbf(16);

            objDescriptor.frequencies.push(frequency);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorTerrestrialDeliverySystem;
