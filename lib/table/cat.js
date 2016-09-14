"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableCat {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objCat = {};

        objCat._raw = this.buffer;

        objCat.table_id = reader.uimsbf(8);
        objCat.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // '0'
        reader.next(2);    // reserved
        objCat.section_length = reader.uimsbf(12);
        reader.next(18);    // reserved
        objCat.version_number = reader.uimsbf(5);
        objCat.current_next_indicator = reader.bslbf(1);
        objCat.section_number = reader.uimsbf(8);
        objCat.last_section_number = reader.uimsbf(8);

        objCat.descriptors = new TsDescriptors(reader.readBytesRaw(3 + objCat.section_length - (reader.position >> 3) - 4)).decode();

        objCat.CRC_32 = reader.readBytes(4);

        return objCat;
    }
}

module.exports = TsTableCat;
