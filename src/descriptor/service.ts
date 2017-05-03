import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Service extends Descriptor {
    service_type: number;
    service_provider_name_length: number;
    service_provider_name: Buffer;
    service_name_length: number;
    service_name: Buffer;
}

export default class TsDescriptorService extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Service {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Service;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.service_type = reader.uimsbf(8);
        objDescriptor.service_provider_name_length = reader.uimsbf(8);
        objDescriptor.service_provider_name = reader.readBytes(objDescriptor.service_provider_name_length);
        objDescriptor.service_name_length = reader.uimsbf(8);
        objDescriptor.service_name = reader.readBytes(objDescriptor.service_name_length);

        return objDescriptor;
    }
}
