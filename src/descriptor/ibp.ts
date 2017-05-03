import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Ibp extends Descriptor {
    closed_gop_flag: number;
    identical_gop_flag: number;
    max_gop_length: number;
}

export default class TsDescriptorIbp extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Ibp {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Ibp;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.closed_gop_flag = reader.uimsbf(1);
        objDescriptor.identical_gop_flag = reader.uimsbf(1);
        objDescriptor.max_gop_length = reader.uimsbf(14);

        return objDescriptor;
    }
}
