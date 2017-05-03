import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface VideoWindow extends Descriptor {
    horizontal_offset: number;
    vertical_offset: number;
    window_priority: number;
}

export default class TsDescriptorVideoWindow extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as VideoWindow;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.horizontal_offset = reader.uimsbf(14);
        objDescriptor.vertical_offset = reader.uimsbf(14);
        objDescriptor.window_priority = reader.uimsbf(4);

        return objDescriptor;
    }
}
