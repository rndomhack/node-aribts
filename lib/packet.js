"use strict";

const Reader = require("./reader");

class TsPacketParser {
    constructor() {

    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objPacket = {};

        objPacket._raw = buffer;

        objPacket.sync_byte = reader.bslbf(8);
        objPacket.transport_error_indicator = reader.bslbf(1);
        objPacket.payload_unit_start_indicator = reader.bslbf(1);
        objPacket.transport_priority = reader.bslbf(1);
        objPacket.PID = reader.uimsbf(13);
        objPacket.transport_scrambling_control = reader.bslbf(2);
        objPacket.adaptation_field_control = reader.bslbf(2);
        objPacket.continuity_counter = reader.uimsbf(4);

        if (objPacket.adaptation_field_control === 0b10 || objPacket.adaptation_field_control === 0b11) {
            let adaptation_field_length = reader.uimsbf(8);

            objPacket.adaptation_field = this.parseAdaptationField(buffer.slice(4, 5 + adaptation_field_length));
            reader.next(adaptation_field_length << 3);
        }

        if (objPacket.adaptation_field_control === 0b01 || objPacket.adaptation_field_control === 0b11) {
            objPacket.data_byte = buffer.slice(reader.position >> 3, 188);
        }

        return objPacket;
    }

    parseAdaptationField(buffer) {
        var reader = new Reader(buffer);
        var objAF = {};

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
                objAF.private_data_byte = [];
                for (let i = 0; i < objAF.transport_private_data_length; i++) {
                    objAF.private_data_byte[i] = reader.bslbf(8);
                }
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

                    let DTS_next_AU_32_30 = reader.bslbf(3);
                    reader.next(1);    // marker_bit
                    let DTS_next_AU_29_15 = reader.bslbf(15);
                    reader.next(1);    // marker_bit
                    let DTS_next_AU_14_0 = reader.bslbf(15);
                    reader.next(1);    // marker_bit

                    objAF.DTS_next_AU = (0x40000000 * DTS_next_AU_32_30)
                        + (DTS_next_AU_29_15 << 15 | DTS_next_AU_14_0);
                }
            }
        }

        return objAF;
    }

    parseBasic(buffer) {
        var reader = new Reader(buffer);
        var objPacket = {};

        objPacket._raw = buffer;

        objPacket.sync_byte = reader.bslbf(8);
        objPacket.transport_error_indicator = reader.bslbf(1);
        objPacket.payload_unit_start_indicator = reader.bslbf(1);
        objPacket.transport_priority = reader.bslbf(1);
        objPacket.PID = reader.uimsbf(13);
        objPacket.transport_scrambling_control = reader.bslbf(2);
        objPacket.adaptation_field_control = reader.bslbf(2);
        objPacket.continuity_counter = reader.uimsbf(4);

        if (objPacket.adaptation_field_control === 0b10 || objPacket.adaptation_field_control === 0b11) {
            let objAF = objPacket.adaptation_field = {};

            objAF.adaptation_field_length = reader.uimsbf(8);

            if (objAF.adaptation_field_length) {
                objAF.discontinuity_indicator = reader.bslbf(1);
                objAF.random_access_indicator = reader.bslbf(1);
                objAF.elementary_stream_priority_indicator = reader.bslbf(1);
                objAF.PCR_flag = reader.bslbf(1);
                objAF.OPCR_flag = reader.bslbf(1);
                objAF.splicing_point_flag = reader.bslbf(1);
                objAF.transport_private_data_flag = reader.bslbf(1);
                objAF.adaptation_field_extension_flag = reader.bslbf(1);
            }
        }

        return objPacket;
    }

    isPes(buffer) {
        if ((buffer[3] & 0x10) >> 4 === 0) return null;

        var offset = (buffer[3] & 0x20) >> 5 === 1 ? 5 + buffer[4] : 4;

        if (buffer[offset] === 0x00 && buffer[offset + 1] === 0x00 && buffer[offset + 2] === 0x01) {
            return true;
        } else {
            return false;
        }
    }

    getPayloadUnitStartIndicator(buffer) {
        return (buffer[1] & 0x40) >> 6;
    }

    getPID(buffer) {
        return (buffer[1] & 0x1F) << 8 | buffer[2];
    }

    getTransportScramblingControl(buffer) {
        return (buffer[3] & 0xC0) >> 6;
    }

    getAdaptationFieldControl(buffer) {
        return (buffer[3] & 0x30) >> 4;
    }

    getContinuityCounter(buffer) {
        return buffer[3] & 0x0F;
    }

    getDiscontinuityIndicator(buffer) {
        if ((buffer[3] & 0x20) >> 5 === 0) return -1;

        return (buffer[5] & 0x80) >> 7;
    }

    getPointerField(buffer) {
        if ((buffer[3] & 0x10) >> 4 === 0) return null;

        if ((buffer[3] & 0x20) >> 5 === 1) {
            return buffer[5 + buffer[4]];
        } else {
            return buffer[4];
        }
    }

    getAdaptationField(buffer) {
        if ((buffer[3] & 0x20) >> 5 === 0) return null;

        return buffer.slice(4, 5 + buffer[4]);
    }

    getData(buffer) {
        if ((buffer[3] & 0x10) >> 4 === 0) return null;

        if ((buffer[3] & 0x20) >> 5 === 1) {
            return buffer.slice(5 + buffer[4], 188);
        } else {
            return buffer.slice(4, 188);
        }
    }
}

module.exports = TsPacketParser;
