import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ContentAvailability extends Descriptor {
    copy_restriction_mode: number;
    image_constraint_token: number;
    retention_mode: number;
    retention_state: number;
    encryption_mode: number;
}

export default class TsDescriptorContentAvailability extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ContentAvailability {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ContentAvailability;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(1);    // reserved_future_use
        objDescriptor.copy_restriction_mode = reader.bslbf(1);
        objDescriptor.image_constraint_token = reader.bslbf(1);
        objDescriptor.retention_mode = reader.bslbf(1);
        objDescriptor.retention_state = reader.bslbf(3);
        objDescriptor.encryption_mode = reader.bslbf(1);

        return objDescriptor;
    }
}
