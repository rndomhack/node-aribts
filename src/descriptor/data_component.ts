import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface DataComponent extends Descriptor {
    data_component_id: number;
    additional_data_component_info: Buffer;
}

export default class TsDescriptorDataComponent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): DataComponent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as DataComponent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.data_component_id = reader.uimsbf(8);
        objDescriptor.additional_data_component_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
