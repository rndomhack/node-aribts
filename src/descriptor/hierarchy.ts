import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface VideoStream extends Descriptor {
    temporal_scalability_flag: number;
    spatial_scalability_flag: number;
    quality_scalability_flag: number;
    hierarchy_type: number;
    hierarchy_layer_index: number;
    tref_present_flag: number;
    hierarchy_embedded_layer_index: number;
    hierarchy_channel: number;
}

export default class TsDescriptorHierarchy extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): VideoStream {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as VideoStream;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(1);    // reserved
        objDescriptor.temporal_scalability_flag = reader.bslbf(1);
        objDescriptor.spatial_scalability_flag = reader.bslbf(1);
        objDescriptor.quality_scalability_flag = reader.bslbf(1);
        objDescriptor.hierarchy_type = reader.uimsbf(4);
        reader.next(2);    // reserved
        objDescriptor.hierarchy_layer_index = reader.uimsbf(6);
        objDescriptor.tref_present_flag = reader.bslbf(1);
        reader.next(1);    // reserved
        objDescriptor.hierarchy_embedded_layer_index = reader.uimsbf(6);
        reader.next(2);    // reserved
        objDescriptor.hierarchy_channel = reader.uimsbf(6);

        return objDescriptor;
    }
}
