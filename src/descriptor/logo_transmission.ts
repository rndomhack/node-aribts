import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface LogoTransmission extends Descriptor {
    logo_transmission_type: number;
    logo_id?: number;
    logo_version?: number;
    download_data_id?: number;
    logo?: Buffer;
}

export default class TsDescriptorLogoTransmission extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): LogoTransmission {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as LogoTransmission;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.logo_transmission_type = reader.uimsbf(8);

        if (objDescriptor.logo_transmission_type === 1) {
            reader.next(7);    // reserved_future_use
            objDescriptor.logo_id = reader.uimsbf(9);
            reader.next(4);    // reserved_future_use
            objDescriptor.logo_version = reader.uimsbf(12);
            objDescriptor.download_data_id = reader.uimsbf(16);
        } else if (objDescriptor.logo_transmission_type === 2) {
            reader.next(7);    // reserved_future_use
            objDescriptor.logo_id = reader.uimsbf(9);
        } else if (objDescriptor.logo_transmission_type === 3) {
            objDescriptor.logo = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));
        }

        return objDescriptor;
    }
}
