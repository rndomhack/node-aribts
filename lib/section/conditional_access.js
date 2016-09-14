"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");
const TsSectionBase = require("./base");

class TsSectionConditionalAccess extends TsSectionBase {
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
        reader.next(18);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.descriptors = new TsDescriptors(reader.readBytesRaw(3 + objSection.section_length - (reader.position >> 3) - 4));

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this.buffer) === 0;
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

module.exports = TsSectionConditionalAccess;
