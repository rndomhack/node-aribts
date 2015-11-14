"use strict";

const Reader = require("../reader");
const TsDescriptorParser = require("../descriptor");

class TsCatParser {
    constructor() {
        this.parser = {
            descriptor: new TsDescriptorParser()
        };
    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objCat = {};
        var pos;

        objCat._raw = buffer;

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

        // descriptor
        pos = reader.position >> 3;
        objCat.descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + objCat.section_length - 5 - 4));
        reader.position += (objCat.section_length - 5 - 4) << 3;

        objCat.CRC_32 = reader.rpchof(32);

        return objCat;
    }
}

module.exports = TsCatParser;
