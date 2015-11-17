"use strict";

const TsReader = require("../reader");

class TsDescriptorCountryAvailability {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.country_availability_flag = reader.bslbf(1);
        reader.next(7);    // reserved_future_use
        objDescriptor.countries = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let country = {};

            country.country_code = reader.bslbf(24);

            objDescriptor.countries.push(country);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCountryAvailability;
