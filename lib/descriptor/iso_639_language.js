"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorIso639Language extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_languages = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const ISO_639_language = {};

            ISO_639_language.ISO_639_language_code = reader.readBytes(3);
            ISO_639_language.audio_type = reader.bslbf(8);

            objDescriptor.ISO_639_languages.push(ISO_639_language);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorIso639Language;
