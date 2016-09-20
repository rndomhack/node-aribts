"use strict";

const TsReader = require("../reader");
const TsSectionBase = require("./base");

class TsSectionTimeAndDate extends TsSectionBase {
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

        return objSection;
    }
}

module.exports = TsSectionTimeAndDate;
