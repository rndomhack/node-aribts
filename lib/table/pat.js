"use strict";

const TsReader = require("../reader");

class TsTablePat {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objPat = {};

        objPat._raw = this.buffer;

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
        objPat.programs = [];

        while (reader.position >> 3 < 3 + objPat.section_length - 4) {
            let program = {};

            program.program_number = reader.uimsbf(16);
            reader.next(3);    // reserved
            if (program.program_number === 0) {
                program.network_PID = reader.uimsbf(13);
            } else {
                program.program_map_PID = reader.uimsbf(13);
            }

            objPat.programs.push(program);
        }

        objPat.CRC_32 = reader.readBytes(4);

        return objPat;
    }
}

module.exports = TsTablePat;
