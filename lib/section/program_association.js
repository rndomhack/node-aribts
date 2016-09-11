"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsWriter = require("../writer");
const TsSectionBase = require("./base");

class TsSectionProgramAssociation extends TsSectionBase {
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
        objSection.transport_stream_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.programs = [];

        while (reader.position >> 3 < 3 + objSection.section_length - 4) {
            const program = {};

            program.program_number = reader.uimsbf(16);
            reader.next(3);    // reserved
            if (program.program_number === 0) {
                program.network_PID = reader.uimsbf(13);
            } else {
                program.program_map_PID = reader.uimsbf(13);
            }

            objSection.programs.push(program);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    encode(objSection) {
        const buffer = Buffer.alloc(0x400);

        const writer = new TsWriter(buffer);

        writer.uimsbf(8, objSection.table_id);
        writer.bslbf(1, objSection.section_syntax_indicator);
        writer.bslbf(1, 0);    // '0'
        writer.bslbf(2, 0b11);    // reserved
        writer.uimsbf(12, 5 + objSection.programs.length * 4 + 4);
        writer.uimsbf(16, objSection.transport_stream_id);
        writer.bslbf(2, 0b11);    // reserved
        writer.uimsbf(5, objSection.version_number);
        writer.bslbf(1, objSection.current_next_indicator);
        writer.uimsbf(8, objSection.section_number);
        writer.uimsbf(8, objSection.last_section_number);

        objSection.programs.forEach(program => {
            writer.uimsbf(16, program.program_number);
            writer.bslbf(3, 0);    // reserved
            if (program.program_number === 0) {
                writer.uimsbf(13, program.network_PID);
            } else {
                writer.uimsbf(13, program.program_map_PID);
            }
        });

        writer.writeBytes(4, new TsCrc32(buffer.slice(0, writer.position >> 3)).decodeBuffer());

        this.buffer = buffer.slice(0, writer.position >> 3);
    }

    checkCrc32() {
        return new TsCrc32(this.buffer).decode() === 0;
    }

    getTransportStreamId() {
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

module.exports = TsSectionProgramAssociation;
