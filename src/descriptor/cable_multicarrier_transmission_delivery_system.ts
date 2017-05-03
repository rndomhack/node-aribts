import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CableMulticarrierTransmissionDeliverySystem extends Descriptor {
    frequency: number;
    frame_type: number;
    FEC_outer: number;
    modulation: number;
    symbol_rate: number;
    FEC_inner: number;
    carrier_group_id: number;
}

export default class TsDescriptorCableMulticarrierTransmissionDeliverySystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CableMulticarrierTransmissionDeliverySystem {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CableMulticarrierTransmissionDeliverySystem;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.frequency = reader.bslbf(32);
        reader.next(8);    // reserved_future_use
        objDescriptor.frame_type = reader.bslbf(4);
        objDescriptor.FEC_outer = reader.bslbf(4);
        objDescriptor.modulation = reader.bslbf(8);
        objDescriptor.symbol_rate = reader.bslbf(28);
        objDescriptor.FEC_inner = reader.bslbf(4);
        objDescriptor.carrier_group_id = reader.bslbf(8);

        return objDescriptor;
    }
}
