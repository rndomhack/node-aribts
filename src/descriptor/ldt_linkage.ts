import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface LdtLinkage extends Descriptor {
    original_service_id: number;
    transport_stream_id: number;
    original_network_id: number;
    descriptions: Description[];
}

export interface Description {
    description_id: number;
    description_type: number;
    user_defined: number;
}

export default class TsDescriptorLdtLinkage extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): LdtLinkage {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as LdtLinkage;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.original_service_id = reader.uimsbf(16);
        objDescriptor.transport_stream_id = reader.uimsbf(16);
        objDescriptor.original_network_id = reader.uimsbf(16);
        objDescriptor.descriptions = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const description = {} as any as Description;

            description.description_id = reader.uimsbf(16);
            reader.uimsbf(4);    // reserved_future_use
            description.description_type = reader.uimsbf(4);
            description.user_defined = reader.bslbf(8);

            objDescriptor.descriptions.push(description);
        }

        return objDescriptor;
    }
}
