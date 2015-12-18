"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableTot {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (new TsCrc32(this.buffer).decode() !== 0) return null;

        var reader = new TsReader(this.buffer);
        var objTot = {};
        var pos;

        objTot._raw = this.buffer;

        objTot.table_id = reader.uimsbf(8);
        objTot.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objTot.section_length = reader.uimsbf(12);
        objTot.JST_time = reader.readBytes(5);
        reader.next(4);    // reserved
        objTot.descriptors_loop_length = reader.uimsbf(12);

        // descriptors
        pos = reader.position >> 3;
        objTot.descriptors = new TsDescriptors(this.buffer.slice(pos, pos + objTot.descriptors_loop_length)).decode();
        reader.position += objTot.descriptors_loop_length << 3;

        objTot.CRC_32 = reader.readBytes(4);

        return objTot;
    }
}

module.exports = TsTableTot;
