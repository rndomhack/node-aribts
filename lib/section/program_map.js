"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");
const TsSectionBase = require("./base");

class TsSectionProgramMap extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objSection = {};

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // '0'
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.program_number = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        reader.next(3);    // reserved
        objSection.PCR_PID = reader.uimsbf(13);
        reader.next(4);    // reserved
        objSection.program_info_length = reader.uimsbf(12);
        objSection.program_info = new TsDescriptors(reader.readBytesRaw(objSection.program_info_length));

        objSection.streams = [];

        while (reader.position >> 3 < 3 + objSection.section_length - 4) {
            const stream = {};

            stream.stream_type = reader.uimsbf(8);
            reader.next(3);    // reserved
            stream.elementary_PID = reader.uimsbf(13);
            reader.next(4);    // reserved
            stream.ES_info_length = reader.uimsbf(12);
            stream.ES_info = new TsDescriptors(reader.readBytesRaw(stream.ES_info_length));

            objSection.streams.push(stream);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return new TsCrc32(this.buffer).decode() === 0;
    }

    getProgramNumber() {
        return this.buffer[3] << 8 | this.buffer[4];
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

module.exports = TsSectionProgramMap;
