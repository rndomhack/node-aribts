import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Stuffing extends Descriptor {
    stuffing: Buffer;
}

export default class TsDescriptorStuffing extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Stuffing {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Stuffing;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.stuffing = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
