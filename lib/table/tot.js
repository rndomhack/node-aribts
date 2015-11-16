"use strict";

const Reader = require("../reader");
const TsDescriptorParser = require("../descriptor");

class TsTotParser {
    constructor() {
        this.parser = {
            descriptor: new TsDescriptorParser()
        };
    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objTot = {};
        var pos;

        objTot._raw = buffer;

        objTot.table_id = reader.uimsbf(8);
        objTot.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objTot.section_length = reader.uimsbf(12);
        objTot.JST_time = reader.readBytes(5);
        reader.next(4);    // reserved
        objTot.descriptors_loop_length = reader.uimsbf(12);

        // descriptor
        pos = reader.position >> 3;
        objTot.descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + objTot.descriptors_loop_length));
        reader.position += objTot.descriptors_loop_length << 3;

        objTot.CRC_32 = reader.readBytes(4);

        return objTot;
    }
}

module.exports = TsTotParser;
