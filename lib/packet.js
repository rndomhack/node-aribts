"use strict";

const TsReader = require("./reader");
const TsWriter = require("./writer");

class TsPacket {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        const objPacket = {};

        objPacket._raw = this.buffer;

        objPacket.header = this.decodeHeader();

        if (this.hasAdaptationField()) {
            objPacket.adaptation_field = this.decodeAdaptationField();
        }

        if (this.hasData()) {
            objPacket.data = this.getData();
        }

        return objPacket;
    }

    decodeHeader() {
        const buffer = this.getHeader();
        const reader = new TsReader(buffer);
        const objHeader = {};

        objHeader._raw = buffer;

        objHeader.sync_byte = reader.bslbf(8);
        objHeader.transport_error_indicator = reader.bslbf(1);
        objHeader.payload_unit_start_indicator = reader.bslbf(1);
        objHeader.transport_priority = reader.bslbf(1);
        objHeader.PID = reader.uimsbf(13);
        objHeader.transport_scrambling_control = reader.bslbf(2);
        objHeader.adaptation_field_control = reader.bslbf(2);
        objHeader.continuity_counter = reader.uimsbf(4);

        return objHeader;
    }

    decodeAdaptationField() {
        if (!this.hasAdaptationField()) return null;

        const buffer = this.getAdaptationField();
        const reader = new TsReader(buffer);
        const objAF = {};

        objAF._raw = buffer;

        objAF.adaptation_field_length = reader.uimsbf(8);

        if (objAF.adaptation_field_length > 0) {
            objAF.discontinuity_indicator = reader.bslbf(1);
            objAF.random_access_indicator = reader.bslbf(1);
            objAF.elementary_stream_priority_indicator = reader.bslbf(1);
            objAF.PCR_flag = reader.bslbf(1);
            objAF.OPCR_flag = reader.bslbf(1);
            objAF.splicing_point_flag = reader.bslbf(1);
            objAF.transport_private_data_flag = reader.bslbf(1);
            objAF.adaptation_field_extension_flag = reader.bslbf(1);

            if (objAF.PCR_flag === 1) {
                objAF.program_clock_reference_base = reader.uimsbf(33);
                reader.next(6);    // reserved
                objAF.program_clock_reference_extension = reader.uimsbf(9);
            }

            if (objAF.OPCR_flag === 1) {
                objAF.original_program_clock_reference_base = reader.uimsbf(33);
                reader.next(6);    // reserved
                objAF.original_program_clock_reference_extension = reader.uimsbf(9);
            }

            if (objAF.splicing_point_flag === 1) {
                objAF.splice_countdown = reader.tcimsbf(8);
            }

            if (objAF.transport_private_data_flag === 1) {
                objAF.transport_private_data_length = reader.uimsbf(8);
                objAF.private_data = reader.readBytes(objAF.transport_private_data_length);
            }

            if (objAF.adaptation_field_extension_flag === 1) {
                objAF.adaptation_field_extension_length = reader.uimsbf(8);
                objAF.ltw_flag = reader.bslbf(1);
                objAF.piecewise_rate_flag = reader.bslbf(1);
                objAF.seamless_splice_flag = reader.bslbf(1);
                reader.next(5);    // reserved

                if (objAF.ltw_flag === 1) {
                    objAF.ltw_valid_flag = reader.bslbf(1);
                    objAF.ltw_offset = reader.uimsbf(15);
                }

                if (objAF.piecewise_rate_flag === 1) {
                    reader.next(2);    // reserved
                    objAF.piecewise_rate = reader.uimsbf(22);
                }

                if (objAF.seamless_splice_flag === 1) {
                    objAF.splice_type = reader.bslbf(4);

                    objAF.DTS_next_AU_32_30 = reader.bslbf(3);
                    reader.next(1);    // marker_bit
                    objAF.DTS_next_AU_29_15 = reader.bslbf(15);
                    reader.next(1);    // marker_bit
                    objAF.DTS_next_AU_14_0 = reader.bslbf(15);
                    reader.next(1);    // marker_bit
                }
            }
        }

        return objAF;
    }

    encode(objPacket) {
        const buffer = Buffer.alloc(188);
        const writer = new TsWriter(buffer);

        writer.bslbf(8, 0x47);    // sync_byte
        writer.bslbf(1, 0);    // transport_error_indicator
        writer.bslbf(1, objPacket.header.payload_unit_start_indicator);
        writer.bslbf(1, objPacket.header.transport_priority);
        writer.uimsbf(13, objPacket.header.PID);
        writer.bslbf(2, objPacket.header.transport_scrambling_control);
        writer.bslbf(2, objPacket.header.adaptation_field_control);
        writer.uimsbf(4, objPacket.header.continuity_counter);

        if (objPacket.header.adaptation_field_control === 0b10 || objPacket.header.adaptation_field_control === 0b11) {
            const objAF = objPacket.adaptation_field;

            writer.uimsbf(8, objAF.adaptation_field_length);

            if (objAF.adaptation_field_length > 0) {
                writer.bslbf(1, objAF.discontinuity_indicator);
                writer.bslbf(1, objAF.random_access_indicator);
                writer.bslbf(1, objAF.elementary_stream_priority_indicator);
                writer.bslbf(1, objAF.PCR_flag);
                writer.bslbf(1, objAF.OPCR_flag);
                writer.bslbf(1, objAF.splicing_point_flag);
                writer.bslbf(1, objAF.transport_private_data_flag);
                writer.bslbf(1, objAF.adaptation_field_extension_flag);

                if (objAF.PCR_flag === 1) {
                    writer.uimsbf(2, (objAF.program_clock_reference_base / 0x80000000) | 0);
                    writer.uimsbf(31, (objAF.program_clock_reference_base | 0) >> 1);
                    writer.bslbf(6, 0);    // reserved
                    writer.uimsbf(9, objAF.program_clock_reference_extension);
                }

                if (objAF.OPCR_flag === 1) {
                    writer.uimsbf(2, (objAF.original_program_clock_reference_base / 0x80000000) | 0);
                    writer.uimsbf(31, (objAF.original_program_clock_reference_base | 0) >> 1);
                    writer.bslbf(6, 0);    // reserved
                    writer.uimsbf(9, objAF.original_program_clock_reference_extension);
                }

                if (objAF.splicing_point_flag === 1) {
                    writer.tcimsbf(8, objAF.splice_countdown);
                }

                if (objAF.transport_private_data_flag === 1) {
                    writer.uimsbf(8, objAF.transport_private_data_length);
                    writer.writeBytes(objAF.transport_private_data_length, objAF.private_data);
                }

                if (objAF.adaptation_field_extension_flag === 1) {
                    writer.uimsbf(8, objAF.adaptation_field_extension_length);
                    writer.bslbf(1, objAF.ltw_flag);
                    writer.bslbf(1, objAF.piecewise_rate_flag);
                    writer.bslbf(1, objAF.seamless_splice_flag);
                    writer.bslbf(5, 0);    // reserved

                    if (objAF.ltw_flag === 1) {
                        writer.bslbf(1, objAF.ltw_valid_flag);
                        writer.uimsbf(15, objAF.ltw_offset);
                    }

                    if (objAF.piecewise_rate_flag === 1) {
                        writer.bslbf(2, 0);    // reserved
                        writer.uimsbf(22, objAF.piecewise_rate);
                    }

                    if (objAF.seamless_splice_flag === 1) {
                        writer.bslbf(4, objAF.splice_type);

                        writer.bslbf(3, objAF.DTS_next_AU_32_30);
                        writer.bslbf(1, 1);    // marker_bit
                        writer.bslbf(15, objAF.DTS_next_AU_29_15);
                        writer.bslbf(1, 1);    // marker_bit
                        writer.bslbf(15, objAF.DTS_next_AU_14_0);
                        writer.bslbf(1, 1);    // marker_bit
                    }
                }
            }
        }

        if (objPacket.header.adaptation_field_control === 0b01 || objPacket.header.adaptation_field_control === 0b11) {
            writer.writeBytes(objPacket.data.length, objPacket.data);
        }

        this.buffer = buffer;
    }

    isPes() {
        if ((this.buffer[3] & 0x10) >> 4 === 0) return false;

        const offset = (this.buffer[3] & 0x20) >> 5 === 1 ? 5 + this.buffer[4] : 4;

        if (this.buffer[offset] === 0x00 && this.buffer[offset + 1] === 0x00 && this.buffer[offset + 2] === 0x01) {
            return true;
        } else {
            return false;
        }
    }

    hasAdaptationField() {
        return (this.buffer[3] & 0x20) >> 5 === 1;
    }

    hasData() {
        return (this.buffer[3] & 0x10) >> 4 === 1;
    }

    getBuffer() {
        return this.buffer;
    }

    getHeader() {
        return this.buffer.slice(0, 4);
    }

    getAdaptationField() {
        if (!this.hasAdaptationField()) return null;

        return this.buffer.slice(4, 5 + this.buffer[4]);
    }

    getData() {
        if (!this.hasData()) return null;

        if ((this.buffer[3] & 0x20) >> 5 === 1) {
            return this.buffer.slice(5 + this.buffer[4], 188);
        } else {
            return this.buffer.slice(4, 188);
        }
    }

    getSyncByte() {
        return this.buffer[0];
    }

    getTransportErrorIndicator() {
        return this.buffer[1] >> 7;
    }

    getPayloadUnitStartIndicator() {
        return (this.buffer[1] & 0x40) >> 6;
    }

    getTransportPriority() {
        return (this.buffer[1] & 0x20) >> 5;
    }

    getPid() {
        return (this.buffer[1] & 0x1F) << 8 | this.buffer[2];
    }

    getTransportScramblingControl() {
        return (this.buffer[3] & 0xC0) >> 6;
    }

    getAdaptationFieldControl() {
        return (this.buffer[3] & 0x30) >> 4;
    }

    getContinuityCounter() {
        return this.buffer[3] & 0x0F;
    }

    getAdaptationFieldLength() {
        if (!this.hasAdaptationField()) return -1;

        return this.buffer[4];
    }

    getDiscontinuityIndicator() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return this.buffer[5] >> 7;
    }

    getRandomAccessIndicator() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return (this.buffer[5] & 0x40) >> 6;
    }

    getElementaryStreamPriorityIndicator() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return (this.buffer[5] & 0x20) >> 5;
    }

    getPcrFlag() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return (this.buffer[5] & 0x10) >> 4;
    }

    getOpcrFlag() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return (this.buffer[5] & 0x08) >> 3;
    }

    getSplicingPointFlag() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return (this.buffer[5] & 0x04) >> 2;
    }

    getTransportPrivateDataFlag() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return (this.buffer[5] & 0x02) >> 1;
    }

    getAdaptationFieldExtensionFlag() {
        if (this.getAdaptationFieldLength() < 1) return -1;

        return this.buffer[5] & 0x01;
    }
}

module.exports = TsPacket;
