import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Reference extends Descriptor {
    information_provider_id: number;
    event_relation_id: number;
    references: ReferenceItem[];
}

export interface ReferenceItem {
    reference_node_id: number;
    reference_number: number;
    last_reference_number: number;
}

export default class TsDescriptorReference extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Reference {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Reference;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.information_provider_id = reader.uimsbf(16);
        objDescriptor.event_relation_id = reader.uimsbf(16);
        objDescriptor.references = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const reference = {} as any as ReferenceItem;

            reference.reference_node_id = reader.uimsbf(16);
            reference.reference_number = reader.uimsbf(8);
            reference.last_reference_number = reader.uimsbf(8);

            objDescriptor.references.push(reference);
        }

        return objDescriptor;
    }
}
