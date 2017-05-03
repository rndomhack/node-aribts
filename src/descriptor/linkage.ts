import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Linkage extends Descriptor {
    transport_stream_id: number;
    original_network_id: number;
    service_id: number;
    linkage_type: number;
    private_data: Buffer;
}

export default class TsDescriptorLinkage extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Linkage {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Linkage;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.transport_stream_id = reader.uimsbf(16);
        objDescriptor.original_network_id = reader.uimsbf(16);
        objDescriptor.service_id = reader.bslbf(16);
        objDescriptor.linkage_type = reader.uimsbf(8);
        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
