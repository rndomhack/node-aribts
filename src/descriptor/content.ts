import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Content extends Descriptor {
    contents: ContentItem[];
}

export interface ContentItem {
    content_nibble_level_1: number;
    content_nibble_level_2: number;
    user_nibble_1: number;
    user_nibble_2: number;
}

export default class TsDescriptorContent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Content {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Content;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.contents = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const content = {} as any as ContentItem;

            content.content_nibble_level_1 = reader.uimsbf(4);
            content.content_nibble_level_2 = reader.uimsbf(4);
            content.user_nibble_1 = reader.uimsbf(4);
            content.user_nibble_2 = reader.uimsbf(4);

            objDescriptor.contents.push(content);
        }

        return objDescriptor;
    }
}
