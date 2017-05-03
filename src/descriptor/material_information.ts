import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface MaterialInformation extends Descriptor {
    descriptor_number: number;
    last_descriptor_number: number;
    number_of_material_set: number;
    material_sets: MaterialSet[];
}

export interface MaterialSet {
    material_type: number;
    material_name_length: number;
    material_name: Buffer;
    material_code_type: number;
    material_code_length: number;
    material_code: Buffer;
    material_period_flag: number;
    material_period?: Buffer;
    material_url_type: number;
    material_url_length: number;
    material_url: Buffer;
    reserved_future_use_length: number;
}

export default class TsDescriptorMaterialInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): MaterialInformation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as MaterialInformation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.descriptor_number = reader.uimsbf(4);
        objDescriptor.last_descriptor_number = reader.uimsbf(4);
        objDescriptor.number_of_material_set = reader.uimsbf(8);
        objDescriptor.material_sets = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const material_set = {} as any as MaterialSet;

            material_set.material_type = reader.uimsbf(8);
            material_set.material_name_length = reader.uimsbf(8);
            material_set.material_name = reader.readBytes(material_set.material_name_length);
            material_set.material_code_type = reader.uimsbf(8);
            material_set.material_code_length = reader.uimsbf(8);
            material_set.material_code = reader.readBytes(material_set.material_code_length);
            material_set.material_period_flag = reader.bslbf(1);
            reader.next(7);    // reserved_future_use

            if (material_set.material_period_flag === 1) {
                material_set.material_period = reader.readBytes(3);
            }

            material_set.material_url_type = reader.uimsbf(8);
            material_set.material_url_length = reader.uimsbf(8);
            material_set.material_url = reader.readBytes(material_set.material_url_length);
            material_set.reserved_future_use_length = reader.uimsbf(8);
            reader.next(8 * material_set.reserved_future_use_length);    // reserved_future_use

            objDescriptor.material_sets.push(material_set);
        }

        return objDescriptor;
    }
}
