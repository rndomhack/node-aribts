import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface HierarchicalTransmission extends Descriptor {
    quality_level: number;
    reference_PID: number;
}

export default class TsDescriptorHierarchicalTransmission extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): HierarchicalTransmission {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as HierarchicalTransmission;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(7);    // reserved_future_use
        objDescriptor.quality_level = reader.bslbf(1);
        reader.next(3);    // reserved_future_use
        objDescriptor.reference_PID = reader.uimsbf(13);

        return objDescriptor;
    }
}
