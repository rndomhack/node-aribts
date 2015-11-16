"use strict";

const TsReader = require("./reader");

class TsDescriptors {
    constructor(buffer) {
        this.buffer = buffer;
    }

    descriptor(tag, buffer) {
        var reader = new TsReader(buffer);
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
                objDescriptor.network_name_char = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

                break;

            case 0x41:
                // Service list descriptor
                objDescriptor.service_list = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let service = {};

                    service.service_id = reader.uimsbf(16);
                    service.service_type = reader.uimsbf(8);

                    objDescriptor.service_list.push(service);
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
                objDescriptor.bouquet_name_char = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

                break;

            case 0x48:
                // Service descriptor
                objDescriptor.service_type = reader.uimsbf(8);
                objDescriptor.service_provider_name_length = reader.uimsbf(8);
                objDescriptor.service_provider_name_char = reader.readBytes(objDescriptor.service_provider_name_length);
                objDescriptor.service_name_length = reader.uimsbf(8);
                objDescriptor.service_name_char = reader.readBytes(objDescriptor.service_name_lengt);

                break;

            case 0x49:
                // Country availability descriptor
                objDescriptor.country_availability_flag = reader.bslbf(1);
                reader.next(7);    // reserved_future_use
                objDescriptor.country_availability = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let country = {};

                    country.country_code = reader.bslbf(24);

                    objDescriptor.country_availability.push(country);
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
                objDescriptor.event_name_char = reader.readBytes(objDescriptor.event_name_length);
                objDescriptor.text_length = reader.uimsbf(8);
                objDescriptor.text_char = reader.readBytes(objDescriptor.text_length);

                break;

            case 0x4E:
                // Extended event descriptor
                objDescriptor.descriptor_number = reader.uimsbf(4);
                objDescriptor.last_descriptor_number = reader.uimsbf(4);
                objDescriptor.ISO_639_language_code = reader.bslbf(24);
                objDescriptor.length_of_items = reader.uimsbf(8);
                objDescriptor.items = [];

                for (let i = 0; i < objDescriptor.length_of_items; ) {
                    let item = {};

                    item.item_description_length = reader.uimsbf(8);
                    item.item_description_char = reader.readBytes(item.item_description_length);
                    item.item_length = reader.uimsbf(8);
                    item.item_char = reader.readBytes(item.item_length);

                    objDescriptor.items.push(item);

                    i += 2 + item.item_description_length + item.item_length;
                }

                objDescriptor.text_length = reader.uimsbf(8);
                objDescriptor.text_char = reader.readBytes(objDescriptor.text_length);

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
                objDescriptor.text_char = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

                break;

            case 0x51:
                // Mosaic descriptor
                objDescriptor.descriptor_tag = reader.uimsbf(8);
                objDescriptor.descriptor_length = reader.uimsbf(8);
                objDescriptor.mosaic_entry_point = reader.bslbf(1);
                objDescriptor.number_of_horizontal_elementary_cells = reader.uimsbf(3);
                reader.next(1);    // reserved_future_use
                objDescriptor.number_of_vertical_elementary_cells = reader.uimsbf(3);
                objDescriptor.vertical_elementary_cells = [];
                objDescriptor.logical_cells = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let logical_cell = {};

                    logical_cell.logical_cell_id = reader.uimsbf(6);
                    reader.next(7);    // reserved_future_use
                    logical_cell.logical_cell_presentation_info = reader.uimsbf(3);
                    logical_cell.elementary_cell_field_length = reader.uimsbf(8);
                    logical_cell.elementary_cell_field = [];

                    for (let j = 0; j < logical_cell.elementary_cell_field_length; j++) {
                        let elementary_cell_field = {};

                        reader.next(2);    // reserved_future_use
                        elementary_cell_field.elementary_cell_id = reader.uimsbf(6);

                        logical_cell.elementary_cell_field.push(elementary_cell_field);
                    }

                    logical_cell.cell_linkage_info = reader.uimsbf(8);

                    if (logical_cell.cell_linkage_info === 0x01) {
                        logical_cell.bouquet_id = reader.uimsbf(16);
                    }

                    if (logical_cell.cell_linkage_info === 0x02) {
                        logical_cell.original_network_id = reader.uimsbf(16);
                        logical_cell.transport_stream_id = reader.uimsbf(16);
                        logical_cell.service_id = reader.uimsbf(16);
                    }

                    if (logical_cell.cell_linkage_info === 0x03) {
                        logical_cell.original_network_id = reader.uimsbf(16);
                        logical_cell.transport_stream_id = reader.uimsbf(16);
                        logical_cell.service_id = reader.uimsbf(16);
                    }

                    if (logical_cell.cell_linkage_info === 0x04) {
                        logical_cell.original_network_id = reader.uimsbf(16);
                        logical_cell.transport_stream_id = reader.uimsbf(16);
                        logical_cell.service_id = reader.uimsbf(16);
                        logical_cell.event_id = reader.uimsbf(16);
                    }

                    objDescriptor.logical_cells.push(logical_cell);
                }

                break;

            case 0x52:
                //  Stream identifier descriptor
                objDescriptor.component_tag = reader.uimsbf(8);

                break;

            case 0x53:
                // CA identifier descriptor
                objDescriptor.CA_identifier = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let CA_identifier = {};

                    CA_identifier.CA_system_id = reader.uimsbf(16);

                    objDescriptor.CA_identifier.push(CA_identifier);
                }

                break;

            case 0x54:
                // Content descriptor
                objDescriptor.content = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let content = {};

                    content.content_nibble_level_1 = reader.uimsbf(4);
                    content.content_nibble_level_2 = reader.uimsbf(4);
                    content.user_nibble = reader.uimsbf(4);
                    content.user_nibble = reader.uimsbf(4);

                    objDescriptor.content.push(content);
                }

                break;

            case 0x55:
                // Parental rating descriptor
                objDescriptor.parental_rating = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let parental_rating = {};

                    parental_rating.country_code = reader.bslbf(24);
                    parental_rating.rating = reader.uimsbf(8);

                    objDescriptor.parental_rating.push(parental_rating);
                }

                break;

            case 0x58:
                // Local time offset descriptor
                objDescriptor.local_time_offset = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let local_time_offset = {};

                    local_time_offset.country_code = reader.bslbf(24);
                    local_time_offset.country_region_id = reader.bslbf(6);
                    reader.next(1);    // reserved
                    local_time_offset.local_time_offset_polarity = reader.bslbf(1);
                    local_time_offset.local_time_offset = reader.bslbf(16);
                    local_time_offset.time_of_change = reader.readBytes(5);
                    local_time_offset.next_time_offset = reader.bslbf(16);

                    objDescriptor.local_time_offset.push(local_time_offset);
                }

                break;

            case 0x63:
                // Partial Transport Stream descriptor
                reader.next(2);    // reserved_future_use
                objDescriptor.peak_rate = reader.uimsbf(22);
                reader.next(2);    // reserved_future_use
                objDescriptor.minimum_overall_smoothing_rate = reader.uimsbf(22);
                reader.next(2);    // reserved_future_use
                objDescriptor.maximum_overall_smoothing_buffer = reader.uimsbf(14);

                break;

            case 0x66:
                // Data broadcast id descriptor
                objDescriptor.data_broadcast_id = reader.uimsbf(16);
                objDescriptor.id_selector_byte = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

                break;

            case 0x67:
                // Material information descriptor
                objDescriptor.descriptor_number = reader.uimsbf(4);
                objDescriptor.last_descriptor_number = reader.uimsbf(4);
                objDescriptor.number_of_material_set = reader.uimsbf(8);
                objDescriptor.material_set = [];

                while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                    let material_set = {};

                    material_set.material_type = reader.uimsbf(8);
                    material_set.material_name_length = reader.uimsbf(8);
                    material_set.material_name_char = reader.readBytes(material_set.material_name_length);
                    material_set.material_code_type = reader.uimsbf(8);
                    material_set.material_code_length = reader.uimsbf(8);
                    material_set.material_code_char = reader.readBytes(material_set.material_code_length);
                    material_set.material_period_flag = reader.bslbf(1);
                    reader.next(7);    // reserved_future_use

                    if (material_set.material_period_flag === 1) {
                        material_set.material_period = reader.uimsbf(24);
                    }

                    material_set.material_url_type = reader.uimsbf(8);
                    material_set.material_url_length = reader.uimsbf(8);
                    material_set.material_url_char = reader.readBytes(material_set.material_url_length);
                    material_set.reserved_future_use_length = reader.uimsbf(8);
                    reader.next(8 * material_set.reserved_future_use_length);    // reserved_future_use

                    objDescriptor.material_set.push(material_set);
                }
                break;

            case 0x68:
                // Hybrid information descriptor
                objDescriptor.has_location = reader.bslbf(1);
                objDescriptor.location_type = reader.bslbf(1);
                objDescriptor.format = reader.uimsbf(4);
                objDescriptor.reserved = reader.bslbf(2);

                if (objDescriptor.has_location) {
                    if (objDescriptor.location_type === 0) {
                        objDescriptor.component_tag = reader.uimsbf(8);
                        objDescriptor.module_id = reader.uimsbf(16);
                    } else {
                        objDescriptor.URL_length = reader.uimsbf(8);
                        objDescriptor.URL_byte = reader.readBytes(objDescriptor.URL_length);
                    }
                }

                break;

            default:
                // Unknown descriptor
                pos = reader.position >> 3;
                objDescriptor.descriptor = new Buffer(buffer.slice(pos, pos + objDescriptor.descriptor_length));
                reader.position += objDescriptor.descriptor_length << 3;
        }

        return objDescriptor;
    }

    decode() {
        var arrDescriptors = [];

        for (let i = 0; i < this.buffer.length; ) {
            let descriptorTag = this.buffer[i];
            let descriptorLength = this.buffer[i + 1];

            arrDescriptors.push(this.descriptor(descriptorTag, this.buffer.slice(i, i + 2 + descriptorLength)));

            i += 2 + descriptorLength;
        }

        return arrDescriptors;
    }
}

module.exports = TsDescriptors;
