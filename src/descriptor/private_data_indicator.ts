import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface PrivateDataIndicator extends Descriptor {
    private_data_indicator: Buffer;
}

export default class TsDescriptorPrivateDataIndicator extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): PrivateDataIndicator {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as PrivateDataIndicator;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.private_data_indicator = reader.readBytes(4);

        return objDescriptor;
    }
}
