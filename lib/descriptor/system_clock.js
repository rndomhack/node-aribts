"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorSystemClock extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.external_clock_reference_indicator = reader.bslbf(1);
        reader.next(1);    // reserved
        objDescriptor.clock_accuracy_integer = reader.uimsbf(6);
        objDescriptor.clock_accuracy_exponent = reader.uimsbf(3);
        reader.next(5);    // reserved

        return objDescriptor;
    }
}

module.exports = TsDescriptorSystemClock;
