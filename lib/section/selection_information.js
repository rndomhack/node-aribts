"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");
const TsSectionBase = require("./base");

class TsSectionSelectionInformation extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objSection = {};

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // ISO_reserved
        objSection.section_length = reader.uimsbf(12);
        reader.next(16);    // reserved_future_use
        reader.next(2);    // ISO_reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        reader.next(4);    // reserved_future_use
        objSection.transmission_info_loop_length = reader.uimsbf(12);
        objSection.transmission_info = new TsDescriptors(reader.readBytesRaw(objSection.transmission_info_loop_length));

        objSection.services = [];

        for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
            const service = {};

            service.service_id = reader.uimsbf(16);
            reader.next(1);    // reserved_future_use
            service.running_status = reader.bslbf(3);
            service.service_loop_length = reader.uimsbf(12);
            service.descriptors = new TsDescriptors(reader.readBytesRaw(service.service_loop_length));

            objSection.services.push(service);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return new TsCrc32(this.buffer).decode() === 0;
    }

    getVersionNumber() {
        return (this.buffer[5] & 0x3E) >> 1;
    }

    getCurrentNextIndicator() {
        return this.buffer[5] & 0x01;
    }

    getSectionNumber() {
        return this.buffer[6];
    }

    getLastSectionNumber() {
        return this.buffer[7];
    }
}

module.exports = TsSectionSelectionInformation;
