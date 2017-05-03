import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CableTsDivisionSystem extends Descriptor {
    frequencies: Frequency[];
}

export interface Frequency {
    frequency: number;
    future_use_flag: number;
    multiplex_frame_format_number: number;
    FEC_outer: number;
    modulation: number;
    symbol_rate: number;
    future_use_data_length?: number;
    future_use_data?: Buffer;
    num_of_services: number;
    services: Service[];
}

export interface Service {
    service_id: number;
}

export default class TsDescriptorCableTsDivisionSystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CableTsDivisionSystem {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CableTsDivisionSystem;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.frequencies = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const frequency = {} as any as Frequency;

            frequency.frequency = reader.uimsbf(32);
            reader.next(7);    // '1111111'
            frequency.future_use_flag = reader.bslbf(1);
            frequency.multiplex_frame_format_number = reader.uimsbf(4);
            frequency.FEC_outer = reader.uimsbf(4);
            frequency.modulation = reader.uimsbf(8);
            frequency.symbol_rate = reader.uimsbf(28);
            reader.next(4);    // '1111'

            if (frequency.future_use_flag === 0) {
                frequency.future_use_data_length = reader.uimsbf(8);
                frequency.future_use_data = reader.readBytes(frequency.future_use_data_length);
            }

            frequency.num_of_services = reader.uimsbf(28);
            frequency.services = [];

            for (let i = 0; i < frequency.num_of_services; i++) {
                const service = {} as any as Service;

                service.service_id = reader.uimsbf(16);

                frequency.services.push(service);
            }

            objDescriptor.frequencies.push(frequency);
        }

        return objDescriptor;
    }
}
