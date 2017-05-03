import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface DlProtection extends Descriptor {
    DL_system_ID: number;
    PID: number;
    encrypt_protocol_number: number;
    encrypt_info: Buffer;
}

export default class TsDescriptorDlProtection extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): DlProtection {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as DlProtection;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.DL_system_ID = reader.uimsbf(8);
        reader.next(3);    // '111'
        objDescriptor.PID = reader.uimsbf(13);
        objDescriptor.encrypt_protocol_number = reader.uimsbf(8);
        objDescriptor.encrypt_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
