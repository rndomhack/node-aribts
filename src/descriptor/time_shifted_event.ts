import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface TimeShiftedEvent extends Descriptor {
    reference_service_id: number;
    reference_event_id: number;
}

export default class TsDescriptorTimeShiftedEvent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): TimeShiftedEvent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as TimeShiftedEvent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reference_service_id = reader.uimsbf(16);
        objDescriptor.reference_event_id = reader.uimsbf(16);

        return objDescriptor;
    }
}
