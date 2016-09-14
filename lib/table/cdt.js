"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableCdt {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objCdt = {};

        objCdt._raw = this.buffer;

        objCdt.table_id = reader.uimsbf(8);
        objCdt.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objCdt.section_length = reader.uimsbf(12);
        objCdt.download_data_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objCdt.version_number = reader.uimsbf(5);
        objCdt.current_next_indicator = reader.bslbf(1);
        objCdt.section_number = reader.uimsbf(8);
        objCdt.last_section_number = reader.uimsbf(8);

        objCdt.original_network_id = reader.uimsbf(16);
        objCdt.data_type = reader.uimsbf(8);
        reader.next(4);    // reserved_future_use
        objCdt.descriptors_loop_length = reader.uimsbf(12);
        objCdt.descriptors = new TsDescriptors(reader.readBytesRaw(objCdt.descriptors_loop_length)).decode();
        objCdt.data_module_byte = reader.readBytes(3 + objCdt.section_length - (reader.position >> 3) - 4);

        objCdt.CRC_32 = reader.readBytes(4);

        return objCdt;
    }
}

module.exports = TsTableCdt;
