"use strict";

const TsReader = require("../reader");

class TsDescriptorCountryAvailability {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.country_availability_flag = reader.bslbf(1);
        reader.next(7);    // reserved_future_use
        objDescriptor.country_availabilities = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let country = {};

            country.country_code = reader.readBytes(3);

            objDescriptor.country_availabilities.push(country);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCountryAvailability;
