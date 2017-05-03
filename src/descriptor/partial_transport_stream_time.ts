import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface PartialTransportStreamTime extends Descriptor {
    event_version_number: number;
    event_start_time: Buffer;
    duration: Buffer;
    offset: Buffer;
    offset_flag: number;
    other_descriptor_status: number;
    jst_time_flag: number;
    jst_time?: Buffer;
}

export default class TsDescriptorPartialTransportStreamTime extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): PartialTransportStreamTime {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as PartialTransportStreamTime;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.event_version_number = reader.uimsbf(8);
        objDescriptor.event_start_time = reader.readBytes(5);
        objDescriptor.duration = reader.readBytes(3);
        objDescriptor.offset = reader.readBytes(3);
        reader.next(5);    // reserved
        objDescriptor.offset_flag = reader.bslbf(1);
        objDescriptor.other_descriptor_status = reader.bslbf(1);
        objDescriptor.jst_time_flag = reader.bslbf(1);

        if (objDescriptor.jst_time_flag === 1) {
            objDescriptor.jst_time = reader.readBytes(5);
        }

        return objDescriptor;
    }
}
