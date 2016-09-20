"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");
const TsSectionBase = require("./base");

class TsSectionTimeOffset extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objSection = {};

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);

        objSection.JST_time = reader.readBytes(5);
        reader.next(4);    // reserved
        objSection.descriptors_loop_length = reader.uimsbf(12);
        objSection.descriptors = new TsDescriptors(reader.readBytesRaw(objSection.descriptors_loop_length));

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this._buffer) === 0;
    }
}

module.exports = TsSectionTimeOffset;
