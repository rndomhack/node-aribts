import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface CaContractInfo extends Descriptor {
    CA_system_id: number;
    CA_unit_id: number;
    num_of_component: number;
    components: Component[];
    contract_verification_info_length: number;
    contract_verification_info: Buffer;
    fee_name_length: number;
    fee_name: Buffer;
}

export interface Component {
    component_tag: number;
}

export default class TsDescriptorCaContractInfo extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): CaContractInfo {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as CaContractInfo;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_id = reader.uimsbf(16);
        objDescriptor.CA_unit_id = reader.uimsbf(4);
        objDescriptor.num_of_component = reader.uimsbf(4);
        objDescriptor.components = [];

        for (let i = 0; i < objDescriptor.num_of_component; i++) {
            const component = {} as any as Component;

            component.component_tag = reader.uimsbf(8);

            objDescriptor.components.push(component);
        }

        objDescriptor.contract_verification_info_length = reader.uimsbf(8);
        objDescriptor.contract_verification_info = reader.readBytes(objDescriptor.contract_verification_info_length);
        objDescriptor.fee_name_length = reader.uimsbf(8);
        objDescriptor.fee_name = reader.readBytes(objDescriptor.fee_name_length);

        return objDescriptor;
    }
}
