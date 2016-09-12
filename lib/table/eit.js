"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableEit {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objEit = {};

        objEit._raw = this.buffer;

        objEit.table_id = reader.uimsbf(8);
        objEit.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objEit.section_length = reader.uimsbf(12);
        objEit.service_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objEit.version_number = reader.uimsbf(5);
        objEit.current_next_indicator = reader.bslbf(1);
        objEit.section_number = reader.uimsbf(8);
        objEit.last_section_number = reader.uimsbf(8);

        objEit.transport_stream_id = reader.uimsbf(16);
        objEit.original_network_id = reader.uimsbf(16);
        objEit.segment_last_section_number = reader.uimsbf(8);
        objEit.last_table_id = reader.uimsbf(8);
        objEit.events = [];

        while (reader.position >> 3 < 3 + objEit.section_length - 4) {
            let event = {};

            event.event_id = reader.uimsbf(16);
            event.start_time = reader.readBytes(5);
            event.duration = reader.readBytes(3);
            event.running_status = reader.uimsbf(3);
            event.free_CA_mode = reader.bslbf(1);
            event.descriptors_loop_length = reader.uimsbf(12);
            event.descriptors = new TsDescriptors(reader.readBytesRaw(event.descriptors_loop_length)).decode();

            objEit.events.push(event);
        }

        objEit.CRC_32 = reader.readBytes(4);

        return objEit;
    }
}

module.exports = TsTableEit;
