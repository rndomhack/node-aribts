import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CountryAvailability extends Descriptor {
    country_availability_flag: number;
    country_availabilities: Country[];
}

export interface Country {
    country_code: Buffer;
}

export default class TsDescriptorCountryAvailability extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CountryAvailability {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CountryAvailability;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.country_availability_flag = reader.bslbf(1);
        reader.next(7);    // reserved_future_use
        objDescriptor.country_availabilities = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const country = {} as any as Country;

            country.country_code = reader.readBytes(3);

            objDescriptor.country_availabilities.push(country);
        }

        return objDescriptor;
    }
}
