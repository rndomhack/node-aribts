import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CaStartup extends Descriptor {
    CA_system_ID: number;
    CA_program_ID: number;
    second_load_flag: number;
    load_indicator: number;
    exclusion_ID_num: number;
    exclusion_ID: ExclusionID[];
    load_security_info_len: number;
    load_security_info: Buffer;
    private_data: Buffer;
}

export interface ExclusionID {
    exclusion_CA_program_ID: number;
}

export default class TsDescriptorCaStartup extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CaStartup {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CaStartup;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_ID = reader.uimsbf(16);
        reader.next(3);    // '111'
        objDescriptor.CA_program_ID = reader.uimsbf(13);
        objDescriptor.second_load_flag = reader.bslbf(1);
        objDescriptor.load_indicator = reader.bslbf(7);

        if (objDescriptor.second_load_flag === 1) {
            reader.next(3);    // '111'
            objDescriptor.CA_program_ID = reader.uimsbf(13);
            reader.next(1);    // '1'
            objDescriptor.load_indicator = reader.bslbf(7);
        }

        objDescriptor.exclusion_ID_num = reader.uimsbf(8);
        objDescriptor.exclusion_ID = [];

        for (let i = 0; i < objDescriptor.exclusion_ID_num; i++) {
            const id = {} as any as ExclusionID;

            reader.next(3);    // '111'
            id.exclusion_CA_program_ID = reader.uimsbf(13);

            objDescriptor.exclusion_ID.push(id);
        }

        objDescriptor.load_security_info_len = reader.uimsbf(8);
        objDescriptor.load_security_info = reader.readBytes(objDescriptor.load_security_info_len);

        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
