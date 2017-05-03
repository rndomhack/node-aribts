import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface SiParameter extends Descriptor {
    parameter_version: number;
    update_time: number;
    table_id: number;
    table_description_length: number;
    table_description: Buffer;
}

export default class TsDescriptorSiParameter extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): SiParameter {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as SiParameter;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.parameter_version = reader.uimsbf(8);
        objDescriptor.update_time = reader.uimsbf(16);

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            objDescriptor.table_id = reader.uimsbf(8);
            objDescriptor.table_description_length = reader.uimsbf(8);
            objDescriptor.table_description = reader.readBytes(objDescriptor.table_description_length);
        }

        return objDescriptor;
    }
}
