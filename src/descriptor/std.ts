import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Std extends Descriptor {
    leak_valid_flag: number;
}

export default class TsDescriptorStd extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Std {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Std;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(7);    // reserved
        objDescriptor.leak_valid_flag = reader.bslbf(1);

        return objDescriptor;
    }
}
