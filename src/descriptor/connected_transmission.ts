import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ConnectedTransmission extends Descriptor {
    connected_transmission_group_id: number;
    segment_type: number;
    modulation_type_A: number;
    modulation_type_B: number;
    modulation_type_C: number;
    additional_connected_transmission_info: Buffer;
}

export default class TsDescriptorConnectedTransmission extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ConnectedTransmission {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ConnectedTransmission;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.connected_transmission_group_id = reader.uimsbf(16);
        objDescriptor.segment_type = reader.bslbf(2);
        objDescriptor.modulation_type_A = reader.bslbf(2);
        objDescriptor.modulation_type_B = reader.bslbf(2);
        objDescriptor.modulation_type_C = reader.bslbf(2);
        objDescriptor.additional_connected_transmission_info = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
