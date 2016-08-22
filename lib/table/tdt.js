"use strict";

const TsReader = require("../reader");

class TsTableTdt {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objTdt = {};

        objTdt._raw = this.buffer;

        objTdt.table_id = reader.uimsbf(8);
        objTdt.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objTdt.section_length = reader.uimsbf(12);

        objTdt.JST_time = reader.readBytes(5);

        return objTdt;
    }
}

module.exports = TsTableTdt;
