import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";
import TsCarouselDescriptors from "../carousel_descriptors";

export interface CarouselCompatibleComposite extends Descriptor {
    sub_descriptors: TsCarouselDescriptors;
}

export default class TsDescriptorCarouselCompatibleComposite extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CarouselCompatibleComposite {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CarouselCompatibleComposite;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.sub_descriptors = new TsCarouselDescriptors(reader.readBytesRaw(2 + objDescriptor.descriptor_length - (reader.position >> 3)));

        return objDescriptor;
    }
}
