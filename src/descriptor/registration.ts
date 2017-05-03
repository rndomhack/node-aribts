import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Registration extends Descriptor {
    format_identifier: number;
    additional_identification_info: Buffer;
}

export default class TsDescriptorRegistration extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Registration {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Registration;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.format_identifier = reader.uimsbf(32);
        objDescriptor.additional_identification_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
