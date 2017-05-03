import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface SatelliteDeliverySystem extends Descriptor {
    frequency: number;
    orbital_position: number;
    west_east_flag: number;
    polarisation: number;
    modulation: number;
    symbol_rate: number;
    FEC_inner: number;
}

export default class TsDescriptorSatelliteDeliverySystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): SatelliteDeliverySystem {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as SatelliteDeliverySystem;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.frequency = reader.bslbf(32);
        objDescriptor.orbital_position = reader.bslbf(16);
        objDescriptor.west_east_flag = reader.bslbf(1);
        objDescriptor.polarisation = reader.bslbf(2);
        objDescriptor.modulation = reader.bslbf(5);
        objDescriptor.symbol_rate = reader.bslbf(28);
        objDescriptor.FEC_inner = reader.bslbf(4);

        return objDescriptor;
    }
}
