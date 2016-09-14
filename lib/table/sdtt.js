"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");

class TsTableSdtt {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objSdtt = {};

        objSdtt._raw = this.buffer;

        objSdtt.table_id = reader.uimsbf(8);
        objSdtt.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSdtt.section_length = reader.uimsbf(12);
        objSdtt.table_id_ext = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSdtt.version_number = reader.uimsbf(5);
        objSdtt.current_next_indicator = reader.bslbf(1);
        objSdtt.section_number = reader.uimsbf(8);
        objSdtt.last_section_number = reader.uimsbf(8);

        objSdtt.transport_stream_id = reader.uimsbf(16);
        objSdtt.original_network_id = reader.uimsbf(16);
        objSdtt.service_id = reader.uimsbf(16);
        objSdtt.num_of_contents = reader.uimsbf(8);
        objSdtt.contents = [];

        for (let i = 0; i < objSdtt.num_of_contents; i++) {
            let content = {};

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
                let schedule_description = {};

                schedule_description.start_time = reader.readBytes(5);
                schedule_description.duration = reader.readBytes(3);

                content.schedule_descriptions.push(schedule_description);
            }

            content.descriptors = new TsDescriptors(reader.readBytesRaw(content.content_description_length - content.schedule_description_length)).decode();

            objSdtt.contents.push(content);
        }

        objSdtt.CRC_32 = reader.readBytes(4);

        return objSdtt;
    }
}

module.exports = TsTableSdtt;
