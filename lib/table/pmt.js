"use strict";

const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTablePmt {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objPmt = {};
        var pos;

        objPmt._raw = this.buffer;

        objPmt.table_id = reader.uimsbf(8);
        objPmt.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // '0'
        reader.next(2);    // reserved
        objPmt.section_length = reader.uimsbf(12);
        objPmt.program_number = reader.uimsbf(16);
        reader.next(2);    // reserved
        objPmt.version_number = reader.uimsbf(5);
        objPmt.current_next_indicator = reader.bslbf(1);
        objPmt.section_number = reader.uimsbf(8);
        objPmt.last_section_number = reader.uimsbf(8);
        reader.next(3);    // reserved
        objPmt.PCR_PID = reader.uimsbf(13);
        reader.next(4);    // reserved
        objPmt.program_info_length = reader.uimsbf(12);

        // descriptors
        pos = reader.position >> 3;
        objPmt.program_info = new TsDescriptors(this.buffer.slice(pos, pos + objPmt.program_info_length)).decode();
        reader.position += objPmt.program_info_length << 3;

        objPmt.stream = [];

        for (let i = 0, len = objPmt.section_length - objPmt.program_info_length - 9 - 4; i < len; ) {
            let stream = {};

            stream.stream_type = reader.uimsbf(8);
            reader.next(3);    // reserved
            stream.elementary_PID = reader.uimsbf(13);
            reader.next(4);    // reserved
            stream.ES_info_length = reader.uimsbf(12);

            // descriptors
            pos = reader.position >> 3;
            stream.ES_info = new TsDescriptors(this.buffer.slice(pos, pos + stream.ES_info_length)).decode();
            reader.position += stream.ES_info_length << 3;

            objPmt.stream.push(stream);

            i += 5 + stream.ES_info_length;
        }

        objPmt.CRC_32 = reader.readBytes(4);

        return objPmt;
    }
}

module.exports = TsTablePmt;
