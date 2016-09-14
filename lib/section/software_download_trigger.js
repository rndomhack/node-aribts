"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");
const TsSectionBase = require("./base");

class TsSectionSoftwareDownloadTrigger extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objSection = {};

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.table_id_extension = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.transport_stream_id = reader.uimsbf(16);
        objSection.original_network_id = reader.uimsbf(16);
        objSection.service_id = reader.uimsbf(16);
        objSection.num_of_contents = reader.uimsbf(8);
        objSection.contents = [];

        for (let i = 0; i < objSection.num_of_contents; i++) {
            const content = {};

            content.group = reader.bslbf(4);
            content.target_version = reader.uimsbf(12);
            content.new_version = reader.uimsbf(12);
            content.download_level = reader.bslbf(2);
            content.version_indicator = reader.bslbf(2);
            content.content_description_length = reader.uimsbf(12);
            content.maker_id_flag = reader.bslbf(1);
            reader.next(3);    // reserved
            content.schedule_description_length = reader.uimsbf(12);
            content.schedule_time_shift_information = reader.uimsbf(4);
            content.schedule_descriptions = [];

            for (let length = (reader.position >> 3) + content.schedule_description_length; reader.position >> 3 < length; ) {
                const schedule_description = {};

                schedule_description.start_time = reader.readBytes(5);
                schedule_description.duration = reader.readBytes(3);

                content.schedule_descriptions.push(schedule_description);
            }

            content.descriptors = new TsDescriptors(reader.readBytesRaw(content.content_description_length - content.schedule_description_length));

            objSection.contents.push(content);
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
}

module.exports = TsSectionSoftwareDownloadTrigger;
