import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ConditionalAccess extends Descriptor {
    CA_system_ID: number;
    CA_PID: number;
    private_data: Buffer;
}

export default class TsDescriptorConditionalAccess extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ConditionalAccess {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ConditionalAccess;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_ID = reader.uimsbf(16);
        reader.next(3);    // reserved
        objDescriptor.CA_PID = reader.uimsbf(13);
        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
