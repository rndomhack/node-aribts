import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface NodeRelation extends Descriptor {
    reference_type: number;
    external_reference_flag: number;
    information_provider_id?: number;
    event_relation_id?: number;
    reference_node_id: number;
    reference_number: number;
}

export default class TsDescriptorNodeRelation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): NodeRelation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as NodeRelation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reference_type = reader.uimsbf(4);
        objDescriptor.external_reference_flag = reader.bslbf(1);
        reader.next(3);    // reserved_future_use

        if (objDescriptor.external_reference_flag === 1) {
            objDescriptor.information_provider_id = reader.uimsbf(16);
            objDescriptor.event_relation_id = reader.uimsbf(16);
        }

        objDescriptor.reference_node_id = reader.uimsbf(16);
        objDescriptor.reference_number = reader.uimsbf(8);

        return objDescriptor;
    }
}
