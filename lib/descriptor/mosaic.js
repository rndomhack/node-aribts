"use strict";

const TsReader = require("../reader");

class TsDescriptorMosaic {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);
        objDescriptor.mosaic_entry_point = reader.bslbf(1);
        objDescriptor.number_of_horizontal_elementary_cells = reader.uimsbf(3);
        reader.next(1);    // reserved_future_use
        objDescriptor.number_of_vertical_elementary_cells = reader.uimsbf(3);
        objDescriptor.logical_cells = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let logical_cell = {};

            logical_cell.logical_cell_id = reader.uimsbf(6);
            reader.next(7);    // reserved_future_use
            logical_cell.logical_cell_presentation_info = reader.uimsbf(3);
            logical_cell.elementary_cell_field_length = reader.uimsbf(8);
            logical_cell.elementary_cell_fields = [];

            for (let j = 0; j < logical_cell.elementary_cell_field_length; j++) {
                let elementary_cell_field = {};

                reader.next(2);    // reserved_future_use
                elementary_cell_field.elementary_cell_id = reader.uimsbf(6);

                logical_cell.elementary_cell_fields.push(elementary_cell_field);
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

        return objDescriptor;
    }
}

module.exports = TsDescriptorMosaic;
