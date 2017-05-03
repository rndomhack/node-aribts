import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ShortNodeInformation extends Descriptor {
    ISO_639_language_code: number;
    node_name_length: number;
    node_name: Buffer;
    text_length: number;
    text: Buffer;
}

export default class TsDescriptorShortNodeInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ShortNodeInformation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ShortNodeInformation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_language_code = reader.bslbf(24);
        objDescriptor.node_name_length = reader.uimsbf(8);
        objDescriptor.node_name = reader.readBytes(objDescriptor.node_name_length);
        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}
