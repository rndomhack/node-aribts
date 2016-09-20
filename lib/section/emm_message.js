"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsSectionBase = require("./base");

class TsSectionEmmMessage extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this._buffer);
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

        if (objSection.table_id_extension === 0x0000) {
            objSection.messages = [];

            for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
                const message = {};

                message.card_ID = reader.readBytes(6);
                message.message_length = reader.uimsbf(16);
                message.protocol_number = reader.uimsbf(8);
                message.ca_broadcaster_group_ID = reader.uimsbf(8);
                message.message_ID = reader.uimsbf(8);
                message.message_control = reader.uimsbf(8);
                message.message_area = reader.readBytes(message.message_length - 4);

                objSection.messages.push(message);
            }
        } else {
            objSection.ca_broadcaster_group_ID = reader.uimsbf(8);
            objSection.deletion_status = reader.uimsbf(8);
            objSection.displaying_duration1 = reader.uimsbf(8);
            objSection.displaying_duration2 = reader.uimsbf(8);
            objSection.displaying_duration3 = reader.uimsbf(8);
            objSection.displaying_cycle = reader.uimsbf(8);
            objSection.format_version = reader.uimsbf(8);
            objSection.message_length = reader.uimsbf(16);
            objSection.message_area = reader.readBytes(objSection.message_length);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getTableIdExtension() {
        return this._buffer[3] << 8 | this._buffer[4];
    }

    getVersionNumber() {
        return (this._buffer[5] & 0x3E) >> 1;
    }

    getCurrentNextIndicator() {
        return this._buffer[5] & 0x01;
    }

    getSectionNumber() {
        return this._buffer[6];
    }

    getLastSectionNumber() {
        return this._buffer[7];
    }

    getEmmMessagePayloads() {
        const tableIdExtension = this.getTableIdExtension();
        const sectionLength = this.getSectionLength();
        const payloads = [];

        if (tableIdExtension === 0x0000) {
            let bytesRead = 8;

            for (const l = 3 + sectionLength - 4; bytesRead < l; ) {
                const messageLength = this._buffer[bytesRead + 6] << 8 | this._buffer[bytesRead + 7];
                const length = 8 + messageLength;

                payloads.push(this._buffer.slice(bytesRead, bytesRead + length));

                bytesRead += length;
            }
        } else {
            payloads.push(this._buffer.slice(8, 3 + sectionLength - 4));
        }

        return payloads;
    }
}

module.exports = TsSectionEmmMessage;
