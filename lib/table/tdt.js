"use strict";

const Reader = require("../reader");

class TsTdtParser {
    constructor() {

    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objTdt = {};

        objTdt._raw = buffer;

        objTdt.table_id = reader.uimsbf(8);
        objTdt.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objTdt.section_length = reader.uimsbf(12);
        objTdt.JST_time = reader.date(40);

        objTdt.CRC_32 = reader.rpchof(32);

        return objTdt;
    }
}

module.exports = TsTdtParser;
