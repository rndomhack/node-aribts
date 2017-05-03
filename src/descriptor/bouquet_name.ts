import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface BouquetName extends Descriptor {
    bouquet_name: Buffer;
}

export default class TsDescriptorBouquetName extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): BouquetName {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as BouquetName;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.bouquet_name = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
