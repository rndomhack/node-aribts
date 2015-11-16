"use strict";

const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableCat {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objCat = {};
        var pos;

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

        // descriptors
        pos = reader.position >> 3;
        objCat.descriptors = new TsDescriptors(this.buffer.slice(pos, pos + objCat.section_length - 5 - 4)).decode();
        reader.position += (objCat.section_length - 5 - 4) << 3;

        objCat.CRC_32 = reader.readBytes(4);

        return objCat;
    }
}

module.exports = TsTableCat;
