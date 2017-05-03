import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface HybridInformation extends Descriptor {
    has_location: number;
    location_type: number;
    format: number;

    component_tag: number;
    module_id: number;
    URL_length: number;
    URL: Buffer;
}

export default class TsDescriptorHybridInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): HybridInformation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as HybridInformation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.has_location = reader.bslbf(1);
        objDescriptor.location_type = reader.bslbf(1);
        objDescriptor.format = reader.uimsbf(4);
        reader.next(2);    // reserved

        if (objDescriptor.has_location) {
            if (objDescriptor.location_type === 0) {
                objDescriptor.component_tag = reader.uimsbf(8);
                objDescriptor.module_id = reader.uimsbf(16);
            } else {
                objDescriptor.URL_length = reader.uimsbf(8);
                objDescriptor.URL = reader.readBytes(objDescriptor.URL_length);
            }
        }

        return objDescriptor;
    }
}
