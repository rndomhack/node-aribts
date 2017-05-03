import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface PartialTransportStream extends Descriptor {
    peak_rate: number;
    minimum_overall_smoothing_rate: number;
    maximum_overall_smoothing_buffer: number;
}

export default class TsDescriptorPartialTransportStream extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): PartialTransportStream {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as PartialTransportStream;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(2);    // reserved_future_use
        objDescriptor.peak_rate = reader.uimsbf(22);
        reader.next(2);    // reserved_future_use
        objDescriptor.minimum_overall_smoothing_rate = reader.uimsbf(22);
        reader.next(2);    // reserved_future_use
        objDescriptor.maximum_overall_smoothing_buffer = reader.uimsbf(14);

        return objDescriptor;
    }
}
