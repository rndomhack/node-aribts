import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface SmoothingBuffer extends Descriptor {
    sb_leak_rate: number;
    sb_size: number;
}

export default class TsDescriptorSmoothingBuffer extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): SmoothingBuffer {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as SmoothingBuffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(2);    // reserved
        objDescriptor.sb_leak_rate = reader.uimsbf(22);
        reader.next(2);    // reserved
        objDescriptor.sb_size = reader.uimsbf(22);

        return objDescriptor;
    }
}
