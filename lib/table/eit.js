"use strict";

const Reader = require("../reader");
const TsDescriptorParser = require("../descriptor");

class TsEitParser {
    constructor() {
        this.parser = {
            descriptor: new TsDescriptorParser()
        };
    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objEit = {};
        var pos;

        objEit._raw = buffer;

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
            event.start_time = reader.bslbf(40);
            event.duration = reader.uimsbf(24);
            event.running_status = reader.uimsbf(3);
            event.free_CA_mode = reader.bslbf(1);
            event.descriptors_loop_length = reader.uimsbf(12);

            // descriptor
            pos = reader.position >> 3;
            event.descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + event.descriptors_loop_length));
            reader.position += event.descriptors_loop_length << 3;

            objEit.event.push(event);
        }

        objEit.CRC_32 = reader.rpchof(32);

        return objEit;
    }
}

module.exports = TsEitParser;
