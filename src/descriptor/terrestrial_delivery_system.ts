import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface TerrestrialDeliverySystem extends Descriptor {
    area_code: number;
    guard_interval: number;
    transmission_mode: number;
    frequencies: Frequency[];
}

export interface Frequency {
    frequency: number;
}

export default class TsDescriptorTerrestrialDeliverySystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): TerrestrialDeliverySystem {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as TerrestrialDeliverySystem;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.area_code = reader.bslbf(12);
        objDescriptor.guard_interval = reader.bslbf(2);
        objDescriptor.transmission_mode = reader.bslbf(2);
        objDescriptor.frequencies = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const frequency = {} as any as Frequency;

            frequency.frequency = reader.uimsbf(16);

            objDescriptor.frequencies.push(frequency);
        }

        return objDescriptor;
    }
}
