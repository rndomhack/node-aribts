"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableSit {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (new TsCrc32(this.buffer).decode() !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objSit = {};
        let pos;

        objSit._raw = this.buffer;

        objSit.table_id = reader.uimsbf(8);
        objSit.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // ISO_reserved
        objSit.section_length = reader.uimsbf(12);
        reader.next(16);    // reserved_future_use
        reader.next(2);    // ISO_reserved
        objSit.version_number = reader.uimsbf(5);
        objSit.current_next_indicator = reader.bslbf(1);
        objSit.section_number = reader.uimsbf(8);
        objSit.last_section_number = reader.uimsbf(8);
        reader.next(4);    // reserved_future_use
        objSit.transmission_info_loop_length = reader.uimsbf(12);

        // descriptors
        pos = reader.position >> 3;
        objSit.transmission_info = new TsDescriptors(this.buffer.slice(pos, pos + objSit.transmission_info_loop_length)).decode();
        reader.position += objSit.transmission_info_loop_length << 3;

        objSit.services = [];

        while (reader.position >> 3 < 3 + objSit.section_length - 4) {
            let service = {};

            service.service_id = reader.uimsbf(16);
            service.reserved_future_use = reader.uimsbf(1);
            service.running_status = reader.bslbf(3);
            service.service_loop_length = reader.uimsbf(12);

            // descriptors
            pos = reader.position >> 3;
            service.service = new TsDescriptors(this.buffer.slice(pos, pos + service.service_loop_length)).decode();
            reader.position += service.service_loop_length << 3;

            objSit.services.push(service);
        }

        objSit.CRC_32 = reader.readBytes(4);

        return objSit;
    }
}

module.exports = TsTableSit;
