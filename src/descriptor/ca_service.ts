import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CaService extends Descriptor {
    CA_system_id: number;
    ca_broadcaster_group_id: number;
    message_control: number;
    services: Service[];
}

export interface Service {
    service_id: number;
}

export default class TsDescriptorCaService extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CaService {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CaService;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_id = reader.uimsbf(16);
        objDescriptor.ca_broadcaster_group_id = reader.uimsbf(8);
        objDescriptor.message_control = reader.uimsbf(8);
        objDescriptor.services = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const service = {} as any as Service;

            service.service_id = reader.uimsbf(16);

            objDescriptor.services.push(service);
        }

        return objDescriptor;
    }
}
