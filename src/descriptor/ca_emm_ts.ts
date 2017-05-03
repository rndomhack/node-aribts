import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CaEmmTs extends Descriptor {
    CA_system_id: number;
    transport_stream_id: number;
    original_network_id: number;
    power_supply_period: number;
}

export default class TsDescriptorCaEmmTs extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CaEmmTs {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CaEmmTs;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_id = reader.uimsbf(16);
        objDescriptor.transport_stream_id = reader.uimsbf(16);
        objDescriptor.original_network_id = reader.uimsbf(16);
        objDescriptor.power_supply_period = reader.uimsbf(8);

        return objDescriptor;
    }
}
