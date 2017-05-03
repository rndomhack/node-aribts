import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ExtendedEvent extends Descriptor {
    descriptor_number: number;
    last_descriptor_number: number;
    ISO_639_language_code: Buffer;
    length_of_items: number;
    items: Item[];
    text_length: number;
    text: Buffer;
}

export interface Item {
    item_description_length: number;
    item_description: Buffer;
    item_length: number;
    item: Buffer;
}

export default class TsDescriptorExtendedEvent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ExtendedEvent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ExtendedEvent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.descriptor_number = reader.uimsbf(4);
        objDescriptor.last_descriptor_number = reader.uimsbf(4);
        objDescriptor.ISO_639_language_code = reader.readBytes(3);
        objDescriptor.length_of_items = reader.uimsbf(8);
        objDescriptor.items = [];

        for (let i = 0; i < objDescriptor.length_of_items; ) {
            const item = {} as any as Item;

            item.item_description_length = reader.uimsbf(8);
            item.item_description = reader.readBytes(item.item_description_length);
            item.item_length = reader.uimsbf(8);
            item.item = reader.readBytes(item.item_length);

            objDescriptor.items.push(item);

            i += 2 + item.item_description_length + item.item_length;
        }

        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}
