import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface StreamIdentifier extends Descriptor {
    component_tag: number;
}

export default class TsDescriptorStreamIdentifier extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): StreamIdentifier {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as StreamIdentifier;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.component_tag = reader.uimsbf(8);

        return objDescriptor;
    }
}
