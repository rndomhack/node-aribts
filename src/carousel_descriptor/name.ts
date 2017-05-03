import TsReader from "../reader";
import TsCarouselDescriptorBase, { Descriptor } from "./base";

export interface Name extends Descriptor {
    text: Buffer;
}

export default class TsCarouselDescriptorName extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Name {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Name;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.text = reader.readBytes(objDescriptor.descriptor_length);

        return objDescriptor;
    }
}
