import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface EmergencyInformation extends Descriptor {
    services: Service[];
}

export interface Service {
    service_id: number;
    start_end_flag: number;
    signal_level: number;
    area_code_length: number;
    area_codes: AreaCode[];
}

export interface AreaCode {
    area_code: number;
}

export default class TsDescriptorEmergencyInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): EmergencyInformation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as EmergencyInformation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.services = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const service = {} as any as Service;

            service.service_id = reader.uimsbf(16);
            service.start_end_flag = reader.bslbf(1);
            service.signal_level = reader.bslbf(1);
            reader.next(6);    // reserved_future_use
            service.area_code_length = reader.uimsbf(8);
            service.area_codes = [];

            for (const length = (reader.position >> 3) + service.area_code_length; reader.position >> 3 < length; ) {
                const area_code = {} as any as AreaCode;

                area_code.area_code = reader.bslbf(12);
                reader.next(4);    // reserved_future_use

                service.area_codes.push(area_code);
            }

            objDescriptor.services.push(service);
        }

        return objDescriptor;
    }
}
