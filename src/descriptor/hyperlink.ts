import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Hyperlink extends Descriptor {
    hyper_linkage_type: number;
    link_destination_type: number;
    selector_length: number;
    selector: Buffer;
    private_data: Buffer;
}

export default class TsDescriptorHyperlink extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Hyperlink {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Hyperlink;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.hyper_linkage_type = reader.uimsbf(8);
        objDescriptor.link_destination_type = reader.uimsbf(8);
        objDescriptor.selector_length = reader.uimsbf(8);
        objDescriptor.selector = reader.readBytes(objDescriptor.selector_length);
        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
