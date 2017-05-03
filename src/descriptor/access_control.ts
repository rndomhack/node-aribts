import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface AccessControl extends Descriptor {
    CA_system_id: number;
    transmission_type: number;
    PID: number;
    private_data: Buffer;
}

export default class TsDescriptorAccessControl extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): AccessControl {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as AccessControl;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_id = reader.uimsbf(16);
        objDescriptor.transmission_type = reader.bslbf(3);
        objDescriptor.PID = reader.uimsbf(13);
        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
