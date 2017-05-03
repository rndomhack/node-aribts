import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Component extends Descriptor {
    stream_content: number;
    component_type: number;
    component_tag: number;
    ISO_639_language_code: Buffer;
    text: Buffer;
}

export default class TsDescriptorComponent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Component {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Component;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(4);    // reserved_future_use
        objDescriptor.stream_content = reader.uimsbf(4);
        objDescriptor.component_type = reader.uimsbf(8);
        objDescriptor.component_tag = reader.uimsbf(8);
        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.text = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
