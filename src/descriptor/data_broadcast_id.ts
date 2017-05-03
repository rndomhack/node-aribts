import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface DataBroadcastId extends Descriptor {
    data_broadcast_id: number;
    id_selector: Buffer;
}

export default class TsDescriptorDataBroadcastId extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): DataBroadcastId {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as DataBroadcastId;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.data_broadcast_id = reader.uimsbf(16);
        objDescriptor.id_selector = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
