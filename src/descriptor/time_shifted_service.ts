import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface TimeShiftedService extends Descriptor {
    reference_service_id: number;
}

export default class TsDescriptorTimeShiftedService extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): TimeShiftedService {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as TimeShiftedService;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reference_service_id = reader.uimsbf(16);

        return objDescriptor;
    }
}
