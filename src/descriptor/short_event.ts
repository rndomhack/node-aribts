import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ShortEvent extends Descriptor {
    ISO_639_language_code: Buffer;
    event_name_length: number;
    event_name: Buffer;
    text_length: number;
    text: Buffer;
}

export default class TsDescriptorShortEvent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ShortEvent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ShortEvent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.event_name_length = reader.uimsbf(8);
        objDescriptor.event_name = reader.readBytes(objDescriptor.event_name_length);
        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}
