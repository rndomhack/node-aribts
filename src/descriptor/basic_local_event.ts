import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface BasicLocalEvent extends Descriptor {
    segmentation_mode: number;
    segmentation_info_length: number;
    start_time_NPT?: number;
    end_time_NPT?: number;
    start_time?: number;
    duration?: number;
    start_time_extension?: number;
    duration_extension?: number;
    component_tags: ComponentTag[];
}

export interface ComponentTag {
    component_tag: number;
}

export default class TsDescriptorBasicLocalEvent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): BasicLocalEvent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as BasicLocalEvent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(4);    // reserved_future_use
        objDescriptor.segmentation_mode = reader.uimsbf(4);
        objDescriptor.segmentation_info_length = reader.uimsbf(8);

        if (objDescriptor.segmentation_mode === 0) {
            // nothing
        } else if (objDescriptor.segmentation_mode === 1) {
            reader.next(7);    // reserved_future_use
            objDescriptor.start_time_NPT = reader.uimsbf(33);
            reader.next(7);    // reserved_future_use
            objDescriptor.end_time_NPT = reader.uimsbf(33);
        } else if (objDescriptor.segmentation_mode < 6) {
            objDescriptor.start_time = reader.uimsbf(24);
            objDescriptor.duration = reader.uimsbf(24);

            if (objDescriptor.segmentation_info_length === 10) {
                objDescriptor.start_time_extension = reader.uimsbf(12);
                reader.next(4);    // reserved_future_use
                objDescriptor.duration_extension = reader.uimsbf(12);
                reader.next(4);    // reserved_future_use
            }
        } else {
            reader.next(objDescriptor.segmentation_info_length << 3);    // reserved
        }

        objDescriptor.component_tags = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const component_tag = {} as any as ComponentTag;

            component_tag.component_tag = reader.uimsbf(8);

            objDescriptor.component_tags.push(component_tag);
        }

        return objDescriptor;
    }
}
