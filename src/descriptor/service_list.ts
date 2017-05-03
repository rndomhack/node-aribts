import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ServiceList extends Descriptor {
    services: ServiceItem[];
}

export interface ServiceItem {
    service_id: number;
    service_type: number;
}

export default class TsDescriptorServiceList extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ServiceList {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ServiceList;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.services = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const service = {} as any as ServiceItem;

            service.service_id = reader.uimsbf(16);
            service.service_type = reader.uimsbf(8);

            objDescriptor.services.push(service);
        }

        return objDescriptor;
    }
}
