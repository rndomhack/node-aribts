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
                    reader.next(5);    // reserved
                }

                break;

            case 0x03:
                // Audio stream descriptor
                objDescriptor.free_format_flag = reader.bslbf(1);
                objDescriptor.ID = reader.bslbf(1);
                objDescriptor.layer = reader.bslbf(2);
                objDescriptor.variable_rate_audio_indicator = reader.bslbf(1);
                reader.next(3);    // reserved

                break;

            case 0x04:
                // Hierarchy descriptor
                reader.next(4);    // reserved
                objDescriptor.hierarchy_type = reader.uimsbf(4);
                reader.next(2);    // reserved
                objDescriptor.hierarchy_layer_index = reader.uimsbf(6);
                reader.next(2);    // reserved
                objDescriptor.hierarchy_embedded_layer_index = reader.uimsbf(6);
                reader.next(2);    // reserved
                objDescriptor.hierarchy_channel = reader.uimsbf(6);

                break;

            case 0x05:
                // Registration descriptor
                objDescriptor.format_identifier = reader.uimsbf(32);
                objDescriptor.additional_identification_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

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
                reader.next(3);    // reserved
                objDescriptor.CA_PID = reader.uimsbf(13);
                objDescriptor.private_data_byte = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

                break;

            case 0x0A:
                // ISO 639 language descriptor
                objDescriptor.ISO_639_language = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let ISO_639_language = {};

                    ISO_639_language.ISO_639_language_code = reader.bslbf(24);
                    ISO_639_language.audio_type = reader.bslbf(8);

                    objDescriptor.ISO_639_language.push(ISO_639_language);
                }

                break;

            case 0x0B:
                // System clock descriptor
                objDescriptor.external_clock_reference_indicator = reader.bslbf(1);
                reader.next(1);    // reserved
                objDescriptor.clock_accuracy_integer = reader.uimsbf(6);
                objDescriptor.clock_accuracy_exponent = reader.uimsbf(3);
                reader.next(5);    // reserved

                break;

            case 0x0C:
                // Multiplex buffer utilization descriptor
                objDescriptor.bound_valid_flag = reader.bslbf(1);
                objDescriptor.LTW_offset_lower_bound = reader.uimsbf(15);
                reader.next(1);    // reserved
                objDescriptor.LTW_offset_upper_bound = reader.uimsbf(14);

                break;

            case 0x0D:
                // Copyright descriptor
                objDescriptor.copyright_identifier = reader.uimsbf(32);
                objDescriptor.additional_copyright_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

                break;

            case 0x0E:
                // Maximum bitrate descriptor
                reader.next(2);    // reserved
                objDescriptor.maximum_bitrate = reader.uimsbf(22);

                break;

            case 0x0F:
                // Private data indicator descriptor
                objDescriptor.private_data_indicator = reader.uimsbf(32);

                break;

            case 0x10:
                // Smoothing buffer descriptor
                reader.next(2);    // reserved
                objDescriptor.sb_leak_rate = reader.uimsbf(22);
                reader.next(2);    // reserved
                objDescriptor.sb_size = reader.uimsbf(22);

                break;

            case 0x11:
                // STD descriptor
                reader.next(7);    // reserved
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
                objDescriptor.network_name = reader.char((2 + objDescriptor.descriptor_length << 3) - reader.position);

                break;

            case 0x41:
                // Service list descriptor
                objDescriptor.service = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
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
                reader.next(8);    // reserved_future_use
                objDescriptor.multiplex_frame_format_number = reader.bslbf(4);
                objDescriptor.FEC_outer = reader.bslbf(4);
                objDescriptor.modulation = reader.bslbf(8);
                objDescriptor.symbol_rate = reader.bslbf(28);
                objDescriptor.FEC_inner = reader.bslbf(4);

                break;

            case 0x47:
                // Bouquet name descriptor
                objDescriptor.bouquet_name = reader.char((2 + objDescriptor.descriptor_length << 3) - reader.position);

                break;

            case 0x48:
                // Service descriptor
                objDescriptor.service_type = reader.uimsbf(8);
                objDescriptor.service_provider_name_length = reader.uimsbf(8);
                objDescriptor.service_provider_name = reader.char(objDescriptor.service_provider_name_length << 3);
                objDescriptor.service_name_length = reader.uimsbf(8);
                objDescriptor.service_name = reader.char(objDescriptor.service_name_length << 3);

                break;

            case 0x49:
                // Country availability descriptor
                objDescriptor.country_availability_flag = reader.bslbf(1);
                reader.next(7);    // reserved_future_use
                objDescriptor.country = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let country = {};

                    country.country_code = reader.bslbf(24);

                    objDescriptor.country.push(country);
                }

                break;

            case 0x4A:
                // Linkage descriptor
                objDescriptor.transport_stream_id = reader.uimsbf(16);
                objDescriptor.original_network_id = reader.uimsbf(16);
                objDescriptor.service_id = reader.bslbf(16);
                objDescriptor.linkage_type = reader.uimsbf(8);
                objDescriptor.private_data_byte = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

                break;

            case 0x4B:
                //  Near Video On Demand reference descriptor
                objDescriptor.NVOD_reference = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let NVOD_reference = {};

                    NVOD_reference.transport_stream_id = reader.uimsbf(16);
                    NVOD_reference.original_network_id = reader.uimsbf(16);
                    NVOD_reference.service_id = reader.uimsbf(16);

                    objDescriptor.NVOD_reference.push(NVOD_reference);
                }
                break;

            case 0x4C:
                // Time shifted service descriptor
                objDescriptor.reference_service_id = reader.uimsbf(16);

                break;

            case 0x4D:
                // Short event descriptor
                objDescriptor.ISO_639_language_code = reader.bslbf(24);
                objDescriptor.event_name_length = reader.uimsbf(8);
                objDescriptor.event_name = reader.char(objDescriptor.event_name_length << 3);
                objDescriptor.text_length = reader.uimsbf(8);
                objDescriptor.text = reader.char(objDescriptor.text_length << 3);

                break;

            case 0x4E:
                // Extended event descriptor
                objDescriptor.descriptor_number = reader.uimsbf(4);
                objDescriptor.last_descriptor_number = reader.uimsbf(4);
                objDescriptor.ISO_639_language_code = reader.bslbf(24);
                objDescriptor.length_of_items = reader.uimsbf(8);
                objDescriptor.items = [];

                for (let i = 0; i < objDescriptor.length_of_items; i += 3) {
                    let item = {};

                    item.item_description_length = reader.uimsbf(8);
                    item.item_description = reader.char(item.item_description_length << 3);
                    item.item_length = reader.uimsbf(8);
                    item.item = reader.char(item.item_length << 3);

                    objDescriptor.items.push(item);
                }

                objDescriptor.text_length = reader.uimsbf(8);
                objDescriptor.text = reader.char(objDescriptor.text_length << 3);

                break;

            case 0x4F:
                // Time shifted event descriptor
                objDescriptor.reference_service_id = reader.uimsbf(16);
                objDescriptor.reference_event_id = reader.uimsbf(16);

                break;

            case 0x50:
                // Component descriptor
                reader.next(4);    // reserved_future_use
                objDescriptor.stream_content = reader.uimsbf(4);
                objDescriptor.component_type = reader.uimsbf(8);
                objDescriptor.component_tag = reader.uimsbf(8);
                objDescriptor.ISO_639_language_code = reader.bslbf(24);
                objDescriptor.text = reader.char((2 + objDescriptor.descriptor_length << 3) - reader.position);

                break;

            case 0x51:
                // Mosaic descriptor
                objDescriptor.descriptor_tag = reader.uimsbf(8);
                objDescriptor.descriptor_length = reader.uimsbf(8);
                objDescriptor.mosaic_entry_point = reader.bslbf(1);
                objDescriptor.number_of_horizontal_elementary_cells = reader.uimsbf(3);
                reader.next(1);    // reserved_future_use
                objDescriptor.number_of_vertical_elementary_cells = reader.uimsbf(3);

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    objDescriptor.logical_cell_id = reader.uimsbf(6);
                    reader.next(7);    // reserved_future_use
                    objDescriptor.logical_cell_presentation_info = reader.uimsbf(3);
                    objDescriptor.elementary_cell_field_length = reader.uimsbf(8);

                    for (let j = 0; j < objDescriptor.elementary_cell_field_length; j++) {
                        reader.next(2);    // reserved_future_use
                        objDescriptor.elementary_cell_id = reader.uimsbf(6);
                    }

                    objDescriptor.cell_linkage_info = reader.uimsbf(8);

                    if (objDescriptor.cell_linkage_info === 0x01) {
                        objDescriptor.bouquet_id = reader.uimsbf(16);
                    }

                    if (objDescriptor.cell_linkage_info === 0x02) {
                        objDescriptor.original_network_id = reader.uimsbf(16);
                        objDescriptor.transport_stream_id = reader.uimsbf(16);
                        objDescriptor.service_id = reader.uimsbf(16);
                    }

                    if (objDescriptor.cell_linkage_info === 0x03) {
                        objDescriptor.original_network_id = reader.uimsbf(16);
                        objDescriptor.transport_stream_id = reader.uimsbf(16);
                        objDescriptor.service_id = reader.uimsbf(16);
                    }

                    if (objDescriptor.cell_linkage_info === 0x04) {
                        objDescriptor.original_network_id = reader.uimsbf(16);
                        objDescriptor.transport_stream_id = reader.uimsbf(16);
                        objDescriptor.service_id = reader.uimsbf(16);
                        objDescriptor.event_id = reader.uimsbf(16);
                    }
                }

                break;

            case 106:
                break;

            case 107:
                break;

            case 108:
                break;

            case 109:
                break;

            default:
                // Unknown descriptor
                pos = reader.position >> 3;
                objDescriptor.descriptor = new Buffer(buffer.slice(pos, pos + objDescriptor.descriptor_length));
                reader.position += objDescriptor.descriptor_length << 3;
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
