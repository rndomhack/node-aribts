"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptors = require("../descriptors");
const TsSectionBase = require("./base");

class TsSectionEventInformation extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objSection = {};

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.service_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.transport_stream_id = reader.uimsbf(16);
        objSection.original_network_id = reader.uimsbf(16);
        objSection.segment_last_section_number = reader.uimsbf(8);
        objSection.last_table_id = reader.uimsbf(8);
        objSection.events = [];

        for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
            const _event = {};

            _event.event_id = reader.uimsbf(16);
            _event.start_time = reader.readBytes(5);
            _event.duration = reader.readBytes(3);
            _event.running_status = reader.uimsbf(3);
            _event.free_CA_mode = reader.bslbf(1);
            _event.descriptors_loop_length = reader.uimsbf(12);
            _event.descriptors = new TsDescriptors(reader.readBytesRaw(_event.descriptors_loop_length));

            objSection.events.push(_event);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getServiceId() {
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

    getTransportStreamId() {
        return this._buffer[8] << 8 | this._buffer[9];
    }

    getOriginalNetworkId() {
        return this._buffer[10] << 8 | this._buffer[11];
    }

    getSegmentLastSectionNumber() {
        return this._buffer[12];
    }

    getLastTableId() {
        return this._buffer[13];
    }
}

module.exports = TsSectionEventInformation;
