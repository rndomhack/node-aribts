import TsReader from "../reader";
import TsCarouselDescriptorBase, { Descriptor } from "./base";

export interface Type extends Descriptor {
    text: Buffer;
}

export default class TsCarouselDescriptorType extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Type {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Type;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.text = reader.readBytes(objDescriptor.descriptor_length);

        return objDescriptor;
    }
}
