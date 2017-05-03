import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CaIdentifier extends Descriptor {
    CAs: CA[];
}

export interface CA {
    CA_system_id: number;
}

export default class TsDescriptorCaIdentifier extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CaIdentifier {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CaIdentifier;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);
        objDescriptor.CAs = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const CA_identifier = {} as any as CA;

            CA_identifier.CA_system_id = reader.uimsbf(16);

            objDescriptor.CAs.push(CA_identifier);
        }

        return objDescriptor;
    }
}
