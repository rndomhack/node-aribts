"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorParentalRating extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.parental_ratings = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const parental_rating = {};

            parental_rating.country_code = reader.readBytes(3);
            parental_rating.rating = reader.uimsbf(8);

            objDescriptor.parental_ratings.push(parental_rating);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorParentalRating;
