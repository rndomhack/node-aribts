"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableBat {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objBat = {};

        objBat._raw = this.buffer;

        objBat.table_id = reader.uimsbf(8);
        objBat.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objBat.section_length = reader.uimsbf(12);
        objBat.bouquet_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objBat.version_number = reader.uimsbf(5);
        objBat.current_next_indicator = reader.bslbf(1);
        objBat.section_number = reader.uimsbf(8);
        objBat.last_section_number = reader.uimsbf(8);

        reader.next(4);    // reserved_future_use
        objBat.bouquet_descriptors_length = reader.uimsbf(12);
        objBat.bouquet_descriptors = new TsDescriptors(reader.readBytesRaw(objBat.bouquet_descriptors_length)).decode();

        reader.next(4);    // reserved_future_use
        objBat.transport_stream_loop_length = reader.uimsbf(12);
        objBat.transport_streams = [];

        for (let length = (reader.position >> 3) + objBat.transport_stream_loop_length; reader.position >> 3 < length; ) {
            let transport_stream = {};

            transport_stream.transport_stream_id = reader.uimsbf(16);
            transport_stream.original_network_id = reader.uimsbf(16);
            reader.next(4);    // reserved_future_use
            transport_stream.transport_descriptors_length = reader.uimsbf(12);
            transport_stream.transport_descriptors = new TsDescriptors(reader.readBytesRaw(transport_stream.transport_descriptors_length)).decode();

            objBat.transport_streams.push(transport_stream);
        }

        objBat.CRC_32 = reader.readBytes(4);

        return objBat;
    }
}

module.exports = TsTableBat;
