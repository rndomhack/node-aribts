import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface TargetBackgroundGrid extends Descriptor {
    horizontal_size: number;
    vertical_size: number;
    aspect_ratio_information: number;
}

export default class TsDescriptorTargetBackgroundGrid extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): TargetBackgroundGrid {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as TargetBackgroundGrid;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.horizontal_size = reader.uimsbf(14);
        objDescriptor.vertical_size = reader.uimsbf(14);
        objDescriptor.aspect_ratio_information = reader.uimsbf(4);

        return objDescriptor;
    }
}
