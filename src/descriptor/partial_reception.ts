import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface PartialReception extends Descriptor {
    services: Service[];
}

export interface Service {
    service_id: number;
}

export default class TsDescriptorPartialReception extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): PartialReception {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as PartialReception;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.services = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const service = {} as any as Service;

            service.service_id = reader.uimsbf(16);

            objDescriptor.services.push(service);
        }

        return objDescriptor;
    }
}
