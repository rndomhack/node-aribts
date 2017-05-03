import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface MultiplexBufferUtilization extends Descriptor {
    bound_valid_flag: number;
    LTW_offset_lower_bound: number;
    LTW_offset_upper_bound: number;
}

export default class TsDescriptorMultiplexBufferUtilization extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): MultiplexBufferUtilization {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as MultiplexBufferUtilization;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.bound_valid_flag = reader.bslbf(1);
        objDescriptor.LTW_offset_lower_bound = reader.uimsbf(15);
        reader.next(1);    // reserved
        objDescriptor.LTW_offset_upper_bound = reader.uimsbf(14);

        return objDescriptor;
    }
}
