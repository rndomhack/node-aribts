"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorCountryAvailability extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.country_availability_flag = reader.bslbf(1);
        reader.next(7);    // reserved_future_use
        objDescriptor.country_availabilities = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            const country = {};

            country.country_code = reader.readBytes(3);

            objDescriptor.country_availabilities.push(country);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCountryAvailability;
