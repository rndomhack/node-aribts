import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Mosaic extends Descriptor {
    mosaic_entry_point: number;
    number_of_horizontal_elementary_cells: number;
    number_of_vertical_elementary_cells: number;
    logical_cells: LogicalCell[];
}

export interface LogicalCell {
    logical_cell_id: number;
    logical_cell_presentation_info: number;
    elementary_cell_field_length: number;
    elementary_cell_fields: ElementaryCellField[];

    cell_linkage_info: number;

    bouquet_id?: number;
    original_network_id?: number;
    transport_stream_id?: number;
    service_id?: number;
    event_id?: number;
}

export interface ElementaryCellField {
    elementary_cell_id: number;
}

export default class TsDescriptorMosaic extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Mosaic {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Mosaic;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);
        objDescriptor.mosaic_entry_point = reader.bslbf(1);
        objDescriptor.number_of_horizontal_elementary_cells = reader.uimsbf(3);
        reader.next(1);    // reserved_future_use
        objDescriptor.number_of_vertical_elementary_cells = reader.uimsbf(3);
        objDescriptor.logical_cells = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const logical_cell = {} as any as LogicalCell;

            logical_cell.logical_cell_id = reader.uimsbf(6);
            reader.next(7);    // reserved_future_use
            logical_cell.logical_cell_presentation_info = reader.uimsbf(3);
            logical_cell.elementary_cell_field_length = reader.uimsbf(8);
            logical_cell.elementary_cell_fields = [];

            for (let i = 0; i < logical_cell.elementary_cell_field_length; i++) {
                const elementary_cell_field = {} as any as ElementaryCellField;

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
