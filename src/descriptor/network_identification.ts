import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface NetworkIdentification extends Descriptor {
    country_code: Buffer;
    media_type: number;
    network_id: number;
    private_data: Buffer;
}

export default class TsDescriptorNetworkIdentification extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): NetworkIdentification {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as NetworkIdentification;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.country_code = reader.readBytes(3);
        objDescriptor.media_type = reader.bslbf(16);
        objDescriptor.network_id = reader.uimsbf(16);
        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
