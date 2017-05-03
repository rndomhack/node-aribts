import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface TsInformation extends Descriptor {
    remote_control_key_id: number;
    length_of_ts_name: number;
    transmission_type_count: number;
    ts_name: Buffer;
    transmission_types: TransmissionType[];
}

export interface TransmissionType {
    transmission_type_info: number;
    num_of_service: number;
    services: Service[];
}

export interface Service {
    service_id: number;
}

export default class TsDescriptorTsInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): TsInformation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as TsInformation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.remote_control_key_id = reader.uimsbf(8);
        objDescriptor.length_of_ts_name = reader.uimsbf(6);
        objDescriptor.transmission_type_count = reader.uimsbf(2);
        objDescriptor.ts_name = reader.readBytes(objDescriptor.length_of_ts_name);
        objDescriptor.transmission_types = [];

        for (let i = 0; i < objDescriptor.transmission_type_count; i++) {
            const transmission_type = {} as any as TransmissionType;

            transmission_type.transmission_type_info = reader.bslbf(8);
            transmission_type.num_of_service = reader.uimsbf(8);
            transmission_type.services = [];

            for (let j = 0; j < transmission_type.num_of_service; j++) {
                const service = {} as any as Service;

                service.service_id = reader.uimsbf(16);

                transmission_type.services.push(service);
            }

            objDescriptor.transmission_types.push(transmission_type);
        }

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            reader.next(8);    // reserved_future_use
        }

        return objDescriptor;
    }
}
