"use strict";

const Reader = require("./reader");

class TsPatParser {
    constructor() {

    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objPat = {};

        objPat._raw = buffer;

        objPat.table_id = reader.uimsbf(8);
        objPat.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // '0'
        reader.next(2);    // reserved
        objPat.section_length = reader.uimsbf(12);
        objPat.transport_stream_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objPat.version_number = reader.uimsbf(5);
        objPat.current_next_indicator = reader.bslbf(1);
        objPat.section_number = reader.uimsbf(8);
        objPat.last_section_number = reader.uimsbf(8);
        objPat.program = [];

        for (let i = 0, len = objPat.section_length - 5 - 4; i < len; i += 4) {
            let program = {};

            program.program_number = reader.uimsbf(16);
            reader.next(3);    // reserved
            if (program.program_number === 0) {
                program.network_PID = reader.uimsbf(13);
            } else {
                program.program_map_PID = reader.uimsbf(13);
            }

            objPat.program.push(program);
        }

        objPat.CRC_32 = reader.rpchof(32);

        return objPat;
    }
}

module.exports = TsPatParser;
