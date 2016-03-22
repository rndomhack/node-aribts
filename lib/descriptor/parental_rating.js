"use strict";

const TsReader = require("../reader");

class TsDescriptorParentalRating {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.parental_ratings = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let parental_rating = {};

            parental_rating.country_code = reader.readBytes(3);
            parental_rating.rating = reader.uimsbf(8);

            objDescriptor.parental_ratings.push(parental_rating);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorParentalRating;
