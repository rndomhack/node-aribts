import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface BroadcasterName extends Descriptor {
    char: Buffer;
}

export default class TsDescriptorBroadcasterName extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): BroadcasterName {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as BroadcasterName;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.char = reader.readBytes(objDescriptor.descriptor_length);

        return objDescriptor;
    }
}
