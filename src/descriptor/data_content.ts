import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface DataContent extends Descriptor {
    data_component_id: number;
    entry_component: number;
    selector_length: number;
    selector: Buffer;
    num_of_component_ref: number;
    component_ref: Buffer;
    ISO_639_language_code: Buffer;
    text_length: number;
    text: Buffer;
}

export default class TsDescriptorDataContent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): DataContent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as DataContent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.data_component_id = reader.uimsbf(16);
        objDescriptor.entry_component = reader.uimsbf(8);
        objDescriptor.selector_length = reader.uimsbf(8);
        objDescriptor.selector = reader.readBytes(objDescriptor.selector_length);
        objDescriptor.num_of_component_ref = reader.uimsbf(8);
        objDescriptor.component_ref = reader.readBytes(objDescriptor.num_of_component_ref);
        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}
