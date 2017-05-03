import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Copyright extends Descriptor {
    copyright_identifier: Buffer;
    additional_copyright_info: Buffer;
}

export default class TsDescriptorCopyright extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Copyright {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Copyright;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.copyright_identifier = reader.readBytes(4);
        objDescriptor.additional_copyright_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
