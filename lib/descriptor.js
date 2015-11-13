"use strict";

const Reader = require("./reader");

class TsDescriptorParser {
    constructor() {

    }

    parse(buffer) {
        var reader = new Reader(buffer);
        var objDescriptor = {};
        var pos;

        objDescriptor._raw = buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        switch (objDescriptor.descriptor_tag) {
            case 0x00:
            case 0x01:
                // Reserved

                break;

            case 0x02:
                // Video stream descriptor
                objDescriptor.multiple_frame_rate_flag = reader.bslbf(1);
                objDescriptor.frame_rate_code = reader.uimsbf(4);
                objDescriptor.MPEG_1_only_flag = reader.bslbf(1);
                objDescriptor.constrained_parameter_flag = reader.bslbf(1);
                objDescriptor.still_picture_flag = reader.bslbf(1);

                if (objDescriptor.MPEG_1_only_flag === 0) {
                    objDescriptor.profile_and_level_indication = reader.uimsbf(8);
                    objDescriptor.chroma_format = reader.uimsbf(2);
                    objDescriptor.frame_rate_extension_flag = reader.bslbf(1);
                    objDescriptor.reserved = reader.bslbf(5);
                }

                break;

            case 0x03:
                // Audio stream descriptor
                objDescriptor.free_format_flag = reader.bslbf(1);
                objDescriptor.ID = reader.bslbf(1);
                objDescriptor.layer = reader.bslbf(2);
                objDescriptor.variable_rate_audio_indicator = reader.bslbf(1);
                objDescriptor.reserved = reader.bslbf(3);

                break;

            case 0x04:
                // Hierarchy descriptor
                objDescriptor.reserved = reader.bslbf(4);
                objDescriptor.hierarchy_type = reader.uimsbf(4);
                objDescriptor.reserved = reader.bslbf(2);
                objDescriptor.hierarchy_layer_index = reader.uimsbf(6);
                objDescriptor.reserved = reader.bslbf(2);
                objDescriptor.hierarchy_embedded_layer_index = reader.uimsbf(6);
                objDescriptor.reserved = reader.bslbf(2);
                objDescriptor.hierarchy_channel = reader.uimsbf(6);

                break;

            case 0x05:
                // Registration descriptor
                objDescriptor.format_identifier = reader.uimsbf(32);

                pos = reader.position >> 3;
                objDescriptor.additional_identification_info = new Buffer(buffer.slice(pos, 2 + objDescriptor.descriptor_length));
                reader.position = objDescriptor.descriptor_length << 3;

                break;

            case 0x06:
                // Data stream alignment descriptor
                objDescriptor.alignment_type = reader.uimsbf(8);

                break;

            case 0x07:
                // target_background_grid_descriptor
                objDescriptor.horizontal_size = reader.uimsbf(14);
                objDescriptor.vertical_size = reader.uimsbf(14);
                objDescriptor.aspect_ratio_information = reader.uimsbf(4);

                break;

            case 0x08:
                // Video window descriptor
                objDescriptor.horizontal_offset = reader.uimsbf(14);
                objDescriptor.vertical_offset = reader.uimsbf(14);
                objDescriptor.window_priority = reader.uimsbf(4);

                break;

            case 0x09:
                // Conditional access descriptor
                objDescriptor.CA_system_ID = reader.uimsbf(16);
                objDescriptor.reserved = reader.bslbf(3);
                objDescriptor.CA_PID = reader.uimsbf(13);

                pos = reader.position >> 3;
                objDescriptor.private_data_byte = new Buffer(buffer.slice(pos, 2 + objDescriptor.descriptor_length));
                reader.position = objDescriptor.descriptor_length << 3;

                break;

            case 0x0A:
                // ISO 639 language descriptor
                objDescriptor.ISO_639_language = [];

                for (let i = 0; i < objDescriptor.descriptor_length; i += 4) {
                    let ISO_639_language = {};

                    ISO_639_language.ISO_639_language_code = reader.bslbf(24);
                    ISO_639_language.audio_type = reader.bslbf(8);

                    objDescriptor.ISO_639_language.push(ISO_639_language);
                }

                break;

            case 0x0B:
                // System clock descriptor
                objDescriptor.external_clock_reference_indicator = reader.bslbf(1);
                objDescriptor.reserved = reader.bslbf(1);
                objDescriptor.clock_accuracy_integer = reader.uimsbf(6);
                objDescriptor.clock_accuracy_exponent = reader.uimsbf(3);
                objDescriptor.reserved = reader.bslbf(5);

                break;

            case 0x0C:
                // Multiplex buffer utilization descriptor
                objDescriptor.bound_valid_flag = reader.bslbf(1);
                objDescriptor.LTW_offset_lower_bound = reader.uimsbf(15);
                objDescriptor.reserved = reader.bslbf(1);
                objDescriptor.LTW_offset_upper_bound = reader.uimsbf(14);

                break;

            case 0x0D:
                // Copyright descriptor
                objDescriptor.copyright_identifier = reader.uimsbf(32);

                pos = reader.position >> 3;
                objDescriptor.additional_copyright_info = new Buffer(buffer.slice(pos, 2 + objDescriptor.descriptor_length));
                reader.position = objDescriptor.descriptor_length << 3;

                break;

            case 0x0E:
                // Maximum bitrate descriptor
                objDescriptor.reserved = reader.bslbf(2);
                objDescriptor.maximum_bitrate = reader.uimsbf(22);

                break;

            case 0x0F:
                // Private data indicator descriptor
                objDescriptor.private_data_indicator = reader.uimsbf(32);

                break;

            case 0x10:
                // Smoothing buffer descriptor
                objDescriptor.reserved = reader.bslbf(2);
                objDescriptor.sb_leak_rate = reader.uimsbf(22);
                objDescriptor.reserved = reader.bslbf(2);
                objDescriptor.sb_size = reader.uimsbf(22);

                break;

            case 0x11:
                // STD descriptor
                objDescriptor.reserved = reader.bslbf(7);
                objDescriptor.leak_valid_flag = reader.bslbf(1);

                break;

            case 0x12:
                // IBP descriptor
                objDescriptor.closed_gop_flag = reader.uimsbf(1);
                objDescriptor.identical_gop_flag = reader.uimsbf(1);
                objDescriptor.max_gop_length = reader.uimsbf(14);

                break;

            case 0x40:
                // Network name descriptor
                pos = reader.position >> 3;
                objDescriptor.network_name = new Buffer(buffer.slice(pos, 2 + objDescriptor.descriptor_length));
                reader.position = objDescriptor.descriptor_length << 3;

                break;

            case 0x41:
                // Service list descriptor
                objDescriptor.service = [];

                for (let i = 0; i < objDescriptor.descriptor_length; i += 3) {
                    let service = {};

                    service.service_id = reader.uimsbf(16);
                    service.service_type = reader.uimsbf(8);

                    objDescriptor.service.push(service);
                }

                break;

            case 0x42:
                // Stuffing descriptor

                break;

            case 0x43:
                //Satellite delivery system descriptor
                objDescriptor.frequency = reader.bslbf(32);
                objDescriptor.orbital_position = reader.bslbf(16);
                objDescriptor.west_east_flag = reader.bslbf(1);
                objDescriptor.polarisation = reader.bslbf(2);
                objDescriptor.modulation = reader.bslbf(5);
                objDescriptor.symbol_rate = reader.bslbf(28);
                objDescriptor.FEC_inner = reader.bslbf(4);

                break;

            case 0x44:
                //Cable delivery system descriptor
                objDescriptor.frequency = reader.bslbf(32);
                reader.next(8);    //reserved_future_use
                objDescriptor.multiplex_frame_format_number = reader.bslbf(4);
                objDescriptor.FEC_outer = reader.bslbf(4);
                objDescriptor.modulation = reader.bslbf(8);
                objDescriptor.symbol_rate = reader.bslbf(28);
                objDescriptor.FEC_inner = reader.bslbf(4);

                break;

            case 0x47:
                // Bouquet name descriptor
                pos = reader.position >> 3;
                objDescriptor.bouquet_name = new Buffer(buffer.slice(pos, 2 + objDescriptor.descriptor_length));
                reader.position = objDescriptor.descriptor_length << 3;

                break;

            case 0x48:
                // Service descriptor
                objDescriptor.service_type = reader.uimsbf(8);
                objDescriptor.service_provider_name_length = reader.uimsbf(8);

                pos = reader.position >> 3;
                objDescriptor.service_provider_name = new Buffer(buffer.slice(pos, pos + objDescriptor.service_provider_name_length));
                reader.position += objDescriptor.service_provider_name_length << 3;

                objDescriptor.service_name_length = reader.uimsbf(8);

                pos = reader.position >> 3;
                objDescriptor.service_name = new Buffer(buffer.slice(pos, pos + objDescriptor.service_name_length));
                reader.position += objDescriptor.service_name_length << 3;

                break;

            case 0x49:
                // Country availability descriptor
                objDescriptor.country_availability_flag = reader.bslbf(1);
                objDescriptor.reserved_future_use = reader.bslbf(7);
                objDescriptor.country = [];

                for (let i = 0; i < objDescriptor.descriptor_length; i += 3) {
                    let country = {};

                    country.country_code = reader.bslbf(24);

                    objDescriptor.country.push(country);
                }

                break;

            case 402:
                break;

            case 403:
                break;

            case 404:
                break;

            case 405:
                break;

            default:
                // Unknown descriptor
                pos = reader.position >> 3;
                objDescriptor.descriptor = new Buffer(buffer.slice(pos, pos + objDescriptor.descriptor_length));
                reader.position += objDescriptor.descriptor_length << 3;
        }

        if (objDescriptor.descriptor_tag === 0x49) {
            console.log(objDescriptor);
            console.log(reader.position, buffer.length << 3);
        }

        return objDescriptor;
    }

    parseMulti(buffer) {
        var arrDescriptor = [];

        for (let i = 0; i < buffer.length; ) {
            let descriptorLength = buffer[i + 1];

            arrDescriptor.push(this.parse(buffer.slice(i, i + 2 + descriptorLength)));

            i += 2 + descriptorLength;
        }

        return arrDescriptor;
    }

}

module.exports = TsDescriptorParser;
