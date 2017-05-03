import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface DataStreamAlignment extends Descriptor {
    alignment_type: number;
}

export default class TsDescriptorDataStreamAlignment extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): DataStreamAlignment {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as DataStreamAlignment;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.alignment_type = reader.uimsbf(8);

        return objDescriptor;
    }
}
