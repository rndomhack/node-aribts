import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface TargetRegion extends Descriptor {
    region_spec_type: number;
    target_region_spec: {
        prefecture_bitmap?: Buffer;
    };
}

export default class TsDescriptorTargetRegion extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): TargetRegion {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as TargetRegion;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.region_spec_type = reader.uimsbf(8);
        objDescriptor.target_region_spec = {};

        if (objDescriptor.region_spec_type === 0x01) {
            objDescriptor.target_region_spec.prefecture_bitmap = reader.readBytes(7);
        }

        return objDescriptor;
    }
}
