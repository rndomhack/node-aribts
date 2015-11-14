"use strict";

const Reader = require("../reader");
const TsDescriptorParser = require("../descriptor");

class TsNitParser {
    constructor() {
        this.parser = {
            descriptor: new TsDescriptorParser()
        };
    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objNit = {};
        var pos;

        objNit._raw = buffer;

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

        // descriptor
        pos = reader.position >> 3;
        objNit.network_descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + objNit.network_descriptors_length));
        reader.position += objNit.network_descriptors_length << 3;

        reader.next(4);    // reserved_future_use
        objNit.transport_stream_loop_length = reader.uimsbf(12);
        objNit.transport_stream = [];

        for (let i = 0; i < objNit.transport_stream_loop_length; ) {
            let transport_stream = {};

            transport_stream.transport_stream_id = reader.uimsbf(16);
            transport_stream.original_network_id = reader.uimsbf(16);
            reader.next(4);    // reserved_future_use
            transport_stream.transport_descriptors_length = reader.uimsbf(12);

            // descriptor
            pos = reader.position >> 3;
            transport_stream.transport_descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + transport_stream.transport_descriptors_length));
            reader.position += transport_stream.transport_descriptors_length << 3;

            objNit.transport_stream.push(transport_stream);

            i += 6 + transport_stream.transport_descriptors_length;
        }

        objNit.CRC_32 = reader.rpchof(32);

        return objNit;
    }
}

module.exports = TsNitParser;
