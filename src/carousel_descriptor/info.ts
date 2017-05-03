import TsReader from "../reader";
import TsCarouselDescriptorBase, { Descriptor } from "./base";

export interface Info extends Descriptor {
    ISO_639_language_code: Buffer;
    text: Buffer;
}

export default class TsCarouselDescriptorInfo extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Info {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Info;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.text = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
