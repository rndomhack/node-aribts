"use strict";

const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableEit {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objEit = {};
        var pos;

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
        objEit.event = [];

        while (reader.position < (objEit.section_length << 3) + 24 - 32) {
            let event = {};

            event.event_id = reader.uimsbf(16);
            event.start_time = reader.readBytes(5);
            event.duration = reader.readBytes(3);
            event.running_status = reader.uimsbf(3);
            event.free_CA_mode = reader.bslbf(1);
            event.descriptors_loop_length = reader.uimsbf(12);

            // descriptors
            pos = reader.position >> 3;
            event.descriptors = new TsDescriptors(this.buffer.slice(pos, pos + event.descriptors_loop_length)).decode();
            reader.position += event.descriptors_loop_length << 3;

            objEit.event.push(event);
        }

        objEit.CRC_32 = reader.readBytes(4);

        return objEit;
    }
}

module.exports = TsTableEit;
