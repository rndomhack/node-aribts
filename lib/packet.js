"use strict";

const TsReader = require("./reader");
const TsWriter = require("./writer");

class TsPacket {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objPacket = {};

        objPacket._raw = this.buffer;

        objPacket.sync_byte = reader.bslbf(8);
        objPacket.transport_error_indicator = reader.bslbf(1);
        objPacket.payload_unit_start_indicator = reader.bslbf(1);
        objPacket.transport_priority = reader.bslbf(1);
        objPacket.PID = reader.uimsbf(13);
        objPacket.transport_scrambling_control = reader.bslbf(2);
        objPacket.adaptation_field_control = reader.bslbf(2);
        objPacket.continuity_counter = reader.uimsbf(4);

        if (objPacket.adaptation_field_control === 0b10 || objPacket.adaptation_field_control === 0b11) {
            objPacket.adaptation_field = this.decodeAdaptationField();
            reader.next(reader.uimsbf(8) << 3);
        }

        if (objPacket.adaptation_field_control === 0b01 || objPacket.adaptation_field_control === 0b11) {
            objPacket.data_byte = this.buffer.slice(reader.position >> 3, 188);
        }

        return objPacket;
    }

    decodeAdaptationField() {
        let buffer = TsPacket.getAdaptationField(this.buffer);
        if (buffer === null) return {};

        let reader = new TsReader(buffer);
        let objAF = {};

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
                objAF.private_data_byte = reader.readBytes(objAF.transport_private_data_length);
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

                    /*objAF.DTS_next_AU = (0x40000000 * objAF.DTS_next_AU_32_30)
                        + (objAF.DTS_next_AU_29_15 << 15 | objAF.DTS_next_AU_14_0);*/
                }
            }
        }

        return objAF;
    }

    decodeBasic() {
        let objPacket = {};

        objPacket._raw = this.buffer;

        objPacket.sync_byte = this.buffer[0];
        objPacket.transport_error_indicator = this.buffer[1] >> 7;
        objPacket.payload_unit_start_indicator = (this.buffer[1] & 0x40) >> 6;
        objPacket.transport_priority = (this.buffer[1] & 0x20) >> 5;
        objPacket.PID = (this.buffer[1] & 0x1F) << 8 | this.buffer[2];
        objPacket.transport_scrambling_control = (this.buffer[3] & 0xC0) >> 6;
        objPacket.adaptation_field_control = (this.buffer[3] & 0x30) >> 4;
        objPacket.continuity_counter = this.buffer[3] & 0x0F;

        if (objPacket.adaptation_field_control === 0b10 || objPacket.adaptation_field_control === 0b11) {
            let objAF = objPacket.adaptation_field = {};

            objAF.adaptation_field_length = this.buffer[4];

            if (objAF.adaptation_field_length) {
                objAF.discontinuity_indicator = (this.buffer[5] & 0x80) >> 7;
                objAF.random_access_indicator = (this.buffer[5] & 0x40) >> 6;
                objAF.elementary_stream_priority_indicator = (this.buffer[5] & 0x20) >> 5;
                objAF.PCR_flag = (this.buffer[5] & 0x10) >> 4;
                objAF.OPCR_flag = (this.buffer[5] & 0x08) >> 3;
                objAF.splicing_point_flag = (this.buffer[5] & 0x04) >> 2;
                objAF.transport_private_data_flag = (this.buffer[5] & 0x02) >> 1;
                objAF.adaptation_field_extension_flag = this.buffer[5] & 0x01;
            }
        }

        return objPacket;
    }

    encode(objPacket) {
        let writer = new TsWriter(this.buffer);

        writer.bslbf(8, 0x47);
        writer.bslbf(1, 0);
        writer.bslbf(1, objPacket.payload_unit_start_indicator);
        writer.bslbf(1, objPacket.transport_priority);
        writer.uimsbf(13, objPacket.PID);
        writer.bslbf(2, objPacket.transport_scrambling_control);
        writer.bslbf(2, objPacket.adaptation_field_control);
        writer.uimsbf(4, objPacket.continuity_counter);

        if (objPacket.adaptation_field_control === 0b10 || objPacket.adaptation_field_control === 0b11) {
            let objAF = objPacket.adaptation_field;

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
                    writer.writeBytes(objAF.transport_private_data_length, objAF.private_data_byte);
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

        if (objPacket.adaptation_field_control === 0b01 || objPacket.adaptation_field_control === 0b11) {
            writer.writeBytes(objPacket.data_byte.length, objPacket.data_byte);
        }

        return this.buffer.slice(0, 188);
    }

    static isPes(buffer) {
        if ((buffer[3] & 0x10) >> 4 === 0) return null;

        let offset = (buffer[3] & 0x20) >> 5 === 1 ? 5 + buffer[4] : 4;

        if (buffer[offset] === 0x00 && buffer[offset + 1] === 0x00 && buffer[offset + 2] === 0x01) {
            return true;
        } else {
            return false;
        }
    }

    static getAdaptationField(buffer) {
        if ((buffer[3] & 0x20) >> 5 === 0) return null;

        return buffer.slice(4, 5 + buffer[4]);
    }

    static getData(buffer) {
        if ((buffer[3] & 0x10) >> 4 === 0) return null;

        if ((buffer[3] & 0x20) >> 5 === 1) {
            return buffer.slice(5 + buffer[4], 188);
        } else {
            return buffer.slice(4, 188);
        }
    }
}

module.exports = TsPacket;
