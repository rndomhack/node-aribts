import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface AdvancedCableDeliverySystem extends Descriptor {
    extention_descriptor_tag: number;
    PLP_ID: number;
    effective_symbol_length: number;
    guard_interval: number;
    bundled_channel: number;
    frequencies: Frequency[];
}

export interface Frequency {
    data_slice_id: number;
    tune_freq: number;
    tune_freq_type: number;
    FEC_outer: number;
    modulation: number;
    FEC_inner: number;
}

export default class TsDescriptorAdvancedCableDeliverySystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): AdvancedCableDeliverySystem {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as AdvancedCableDeliverySystem;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.extention_descriptor_tag = reader.uimsbf(8);
        objDescriptor.PLP_ID = reader.uimsbf(8);
        objDescriptor.effective_symbol_length = reader.uimsbf(3);
        objDescriptor.guard_interval = reader.uimsbf(3);
        objDescriptor.bundled_channel = reader.uimsbf(8);
        reader.next(2);    // reserved_future_use

        objDescriptor.frequencies = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const frequency = {} as any as Frequency;

            frequency.data_slice_id = reader.uimsbf(8);
            frequency.tune_freq = reader.uimsbf(32);
            frequency.tune_freq_type = reader.uimsbf(2);
            frequency.FEC_outer = reader.uimsbf(4);
            frequency.modulation = reader.uimsbf(8);
            frequency.FEC_inner = reader.uimsbf(4);
            reader.next(6);    // reserved_future_use

            objDescriptor.frequencies.push(frequency);
        }

        return objDescriptor;
    }
}
