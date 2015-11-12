"use strict";

const Reader = require("./reader");
const TsDescriptorParser = require("./descriptor");

class TsBatParser {
    constructor() {
        this.parser = {
            descriptor: new TsDescriptorParser()
        };
    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objBat = {};
        var pos;

        objBat._raw = buffer;

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

        // descriptor
        pos = reader.position >> 3;
        objBat.bouquet_descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + objBat.bouquet_descriptors_length));
        reader.position += objBat.bouquet_descriptors_length << 3;

        reader.next(4);    // reserved_future_use
        objBat.transport_stream_loop_length = reader.uimsbf(12);

        objBat.transport_stream = [];

        for (let i = 0; i < objBat.transport_stream_loop_length; ) {
            let transport_stream = {};

            transport_stream.transport_stream_id = reader.uimsbf(16);
            transport_stream.original_network_id = reader.uimsbf(16);
            reader.next(4);    // reserved_future_use
            transport_stream.transport_descriptors_length = reader.uimsbf(12);

            // descriptor
            pos = reader.position >> 3;
            transport_stream.transport_descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + transport_stream.transport_descriptors_length));
            reader.position += transport_stream.transport_descriptors_length << 3;

            objBat.transport_stream.push(transport_stream);

            i += 6 + transport_stream.transport_descriptors_length;
        }

        objBat.CRC_32 = reader.rpchof(32);

        return objBat;
    }
}

module.exports = TsBatParser;
