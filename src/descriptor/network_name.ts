import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface NetworkName extends Descriptor {
    network_name: Buffer;
}

export default class TsDescriptorNetworkName extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): NetworkName {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as NetworkName;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.network_name = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
