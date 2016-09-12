"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableSdt {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objSdt = {};

        objSdt._raw = this.buffer;

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
        objSdt.services = [];

        while (reader.position >> 3 < 3 + objSdt.section_length - 4) {
            let service = {};

            service.service_id = reader.uimsbf(16);
            reader.next(3);    // reserved_future_use
            service.EIT_user_defined_flags = reader.bslbf(3);
            service.EIT_schedule_flag = reader.bslbf(1);
            service.EIT_present_following_flag = reader.bslbf(1);
            service.running_status = reader.uimsbf(3);
            service.free_CA_mode = reader.bslbf(1);
            service.descriptors_loop_length = reader.uimsbf(12);
            service.descriptors = new TsDescriptors(reader.readBytesRaw(service.descriptors_loop_length)).decode();

            objSdt.services.push(service);
        }

        objSdt.CRC_32 = reader.readBytes(4);

        return objSdt;
    }
}

module.exports = TsTableSdt;
