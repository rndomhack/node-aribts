"use strict";

const Reader = require("./reader");
const TsDescriptorParser = require("./descriptor");

class TsSdtParser {
    constructor() {
        this.parser = {
            descriptor: new TsDescriptorParser()
        };
    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objSdt = {};
        var pos;

        objSdt._raw = buffer;

        objSdt.table_id = reader.uimsbf(8);
        objSdt.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSdt.section_length = reader.uimsbf(12);
        objSdt.transport_stream_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSdt.version_number = reader.uimsbf(5);
        objSdt.current_next_indicator = reader.bslbf(1);
        objSdt.section_number = reader.uimsbf(8);
        objSdt.last_section_number = reader.uimsbf(8);
        objSdt.original_network_id = reader.uimsbf(16);
        reader.next(8);    // reserved_future_use
        objSdt.service = [];

        for (let i = 0, len = objSdt.section_length - 8 - 4; i < len; ) {
            let service = {};

            service.service_id = reader.uimsbf(16);
            reader.next(3);    // reserved_future_use
            service.EIT_user_defined_flags = reader.bslbf(3);
            service.EIT_schedule_flag = reader.bslbf(1);
            service.EIT_present_following_flag = reader.bslbf(1);
            service.running_status = reader.uimsbf(3);
            service.free_CA_mode = reader.bslbf(1);
            service.descriptors_loop_length = reader.uimsbf(12);

            // descriptor
            pos = reader.position >> 3;
            service.descriptors = this.parser.descriptor.parseMulti(buffer.slice(pos, pos + service.descriptors_loop_length));
            reader.position += service.descriptors_loop_length << 3;

            objSdt.service.push(service);

            i += 5 + service.descriptors_loop_length;
        }

        objSdt.CRC_32 = reader.rpchof(32);

        return objSdt;
    }
}

module.exports = TsSdtParser;
