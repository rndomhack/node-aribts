import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface SystemManagement extends Descriptor {
    system_management_id: number;
    additional_identification_info: Buffer;
}

export default class TsDescriptorSystemManagement extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): SystemManagement {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as SystemManagement;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.system_management_id = reader.uimsbf(16);
        objDescriptor.additional_identification_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
