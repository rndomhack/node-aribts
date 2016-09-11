"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsSectionBase = require("./base");

class TsSectionEmm extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objSection = {};

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        objSection.private_indicator = reader.bslbf(1);
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.table_id_extension = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.messages = [];

        for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
            const message = {};

            message.card_ID = reader.readBytes(6);
            message.associated_information_length = reader.uimsbf(8);
            message.encrypted_data = reader.readBytes(message.associated_information_length);

            objSection.messages.push(message);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return new TsCrc32(this.buffer).decode() === 0;
    }

    getTableIdExtension() {
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

    getEmmPayloads() {
        const sectionLength = this.getSectionLength();
        const payloads = [];
        let bytesRead = 8;

        for (const l = 3 + sectionLength - 4; bytesRead < l; ) {
            const associatedInformationLength = this.buffer[bytesRead + 6] << 8;
            const length = 7 + associatedInformationLength;

            payloads.push(this.buffer.slice(bytesRead, bytesRead + length));

            bytesRead += length;
        }

        return payloads;
    }
}

module.exports = TsSectionEmm;
