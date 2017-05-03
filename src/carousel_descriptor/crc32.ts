import TsReader from "../reader";
import TsCarouselDescriptorBase, { Descriptor } from "./base";

export interface Crc32 extends Descriptor {
    CRC_32: Buffer;
}

export default class TsCarouselDescriptorCrc32 extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Crc32 {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Crc32;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CRC_32 = reader.readBytes(4);

        return objDescriptor;
    }
}
