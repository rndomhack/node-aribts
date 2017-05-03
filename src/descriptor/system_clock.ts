import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface SystemClock extends Descriptor {
    external_clock_reference_indicator: number;
    clock_accuracy_integer: number;
    clock_accuracy_exponent: number;
}

export default class TsDescriptorSystemClock extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): SystemClock {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as SystemClock;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.external_clock_reference_indicator = reader.bslbf(1);
        reader.next(1);    // reserved
        objDescriptor.clock_accuracy_integer = reader.uimsbf(6);
        objDescriptor.clock_accuracy_exponent = reader.uimsbf(3);
        reader.next(5);    // reserved

        return objDescriptor;
    }
}
