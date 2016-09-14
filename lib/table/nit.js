"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableNit {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objNit = {};

        objNit._raw = this.buffer;

        objNit.table_id = reader.uimsbf(8);
        objNit.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objNit.section_length = reader.uimsbf(12);
        objNit.network_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objNit.version_number = reader.uimsbf(5);
        objNit.current_next_indicator = reader.bslbf(1);
        objNit.section_number = reader.uimsbf(8);
        objNit.last_section_number = reader.uimsbf(8);

        reader.next(4);    // reserved_future_use
        objNit.network_descriptors_length = reader.uimsbf(12);
        objNit.network_descriptors = new TsDescriptors(reader.readBytesRaw(objNit.network_descriptors_length)).decode();

        reader.next(4);    // reserved_future_use
        objNit.transport_stream_loop_length = reader.uimsbf(12);
        objNit.transport_streams = [];

        for (let length = (reader.position >> 3) + objNit.transport_stream_loop_length; reader.position >> 3 < length; ) {
            let transport_stream = {};

            transport_stream.transport_stream_id = reader.uimsbf(16);
            transport_stream.original_network_id = reader.uimsbf(16);
            reader.next(4);    // reserved_future_use
            transport_stream.transport_descriptors_length = reader.uimsbf(12);
            transport_stream.transport_descriptors = new TsDescriptors(reader.readBytesRaw(transport_stream.transport_descriptors_length)).decode();

            objNit.transport_streams.push(transport_stream);
        }

        objNit.CRC_32 = reader.readBytes(4);

        return objNit;
    }
}

module.exports = TsTableNit;
