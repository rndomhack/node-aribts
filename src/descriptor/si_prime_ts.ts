import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface SiPrimeTs extends Descriptor {
    parameter_version: number;
    update_time: number;
    SI_prime_ts_network_id: number;
    SI_prime_transport_stream_id: number;
    tables: Table[];
}

export interface Table {
    table_id: number;
    table_description_length: number;
    table_description: Buffer;
}

export default class TsDescriptorSiPrimeTs extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): SiPrimeTs {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as SiPrimeTs;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.parameter_version = reader.uimsbf(8);
        objDescriptor.update_time = reader.uimsbf(16);
        objDescriptor.SI_prime_ts_network_id = reader.uimsbf(16);
        objDescriptor.SI_prime_transport_stream_id = reader.uimsbf(16);
        objDescriptor.tables = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const table = {} as any as Table;

            table.table_id = reader.uimsbf(8);
            table.table_description_length = reader.uimsbf(8);
            table.table_description = reader.readBytes(table.table_description_length);

            objDescriptor.tables.push(table);
        }

        return objDescriptor;
    }
}
