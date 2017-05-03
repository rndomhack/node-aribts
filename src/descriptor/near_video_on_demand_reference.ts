import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface NearVideoOnDemandReference extends Descriptor {
    NVOD_references: Reference[];
}

export interface Reference {
    transport_stream_id: number;
    original_network_id: number;
    service_id: number;
}

export default class TsDescriptorNearVideoOnDemandReference extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): NearVideoOnDemandReference {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as NearVideoOnDemandReference;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.NVOD_references = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const NVOD_reference = {} as any as Reference;

            NVOD_reference.transport_stream_id = reader.uimsbf(16);
            NVOD_reference.original_network_id = reader.uimsbf(16);
            NVOD_reference.service_id = reader.uimsbf(16);

            objDescriptor.NVOD_references.push(NVOD_reference);
        }

        return objDescriptor;
    }
}
