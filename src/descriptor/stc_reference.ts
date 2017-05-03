import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface StcReference extends Descriptor {
    external_event_flag: number;
    STC_reference_mode: number;
    external_event_id?: number;
    external_service_id?: number;
    external_network_id?: number;
    NPT_reference?: number;
    time_reference?: number;
    time_reference_extention?: number;
    STC_reference?: number;
}

export default class TsDescriptorStcReference extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): StcReference {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as StcReference;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(3);    // reserved_future_use
        objDescriptor.external_event_flag = reader.bslbf(1);
        objDescriptor.STC_reference_mode = reader.uimsbf(4);

        if (objDescriptor.external_event_flag === 1) {
            objDescriptor.external_event_id = reader.uimsbf(16);
            objDescriptor.external_service_id = reader.uimsbf(16);
            objDescriptor.external_network_id = reader.uimsbf(16);
        }

        if (objDescriptor.STC_reference_mode === 0) {
            // nothing
        } else if (objDescriptor.STC_reference_mode === 1) {
            reader.next(7);    // reserved_future_use
            objDescriptor.NPT_reference = reader.uimsbf(33);
            reader.next(7);    // reserved_future_use
            objDescriptor.STC_reference = reader.uimsbf(33);
        } else if (objDescriptor.STC_reference_mode === 3 || objDescriptor.STC_reference_mode === 5) {
            objDescriptor.time_reference = reader.uimsbf(24);
            objDescriptor.time_reference_extention = reader.uimsbf(12);
            reader.next(11);    // reserved_future_use
            objDescriptor.STC_reference = reader.uimsbf(33);
        } else {
            // reserved
        }

        return objDescriptor;
    }
}
