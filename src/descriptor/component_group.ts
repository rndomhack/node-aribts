import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ComponentGroup extends Descriptor {
    component_group_type: number;
    total_bit_rate_flag: number;
    num_of_group: number;
    groups: Group[];
}

export interface Group {
    component_group_id: number;
    num_of_CA_unit: number;
    CA_units: CAUnit[];
    total_bit_rate?: number;
    text_length: number;
    text: Buffer;
}

export interface CAUnit {
    CA_unit_id: number;
    num_of_component: number;
    component_tags: ComponentTag[];
}

export interface ComponentTag {
    component_tag: number;
}

export default class TsDescriptorComponentGroup extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ComponentGroup {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ComponentGroup;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.component_group_type = reader.uimsbf(3);
        objDescriptor.total_bit_rate_flag = reader.uimsbf(1);
        objDescriptor.num_of_group = reader.uimsbf(4);
        objDescriptor.groups = [];

        for (let i = 0; i < objDescriptor.num_of_group; i++) {
            const group = {} as any as Group;

            group.component_group_id = reader.uimsbf(4);
            group.num_of_CA_unit = reader.uimsbf(4);
            group.CA_units = [];

            for (let j = 0; j < group.num_of_CA_unit; j++) {
                const CA_unit = {} as any as CAUnit;

                CA_unit.CA_unit_id = reader.uimsbf(4);
                CA_unit.num_of_component = reader.uimsbf(4);
                CA_unit.component_tags = [];

                for (let k = 0; k < CA_unit.num_of_component; k++) {
                    const component_tag = {} as any as ComponentTag;

                    component_tag.component_tag = reader.uimsbf(8);

                    CA_unit.component_tags.push(component_tag);
                }

                group.CA_units.push(CA_unit);
            }

            if (objDescriptor.total_bit_rate_flag === 1) {
                group.total_bit_rate = reader.uimsbf(8);
            }

            group.text_length = reader.uimsbf(8);
            group.text = reader.readBytes(group.text_length);

            objDescriptor.groups.push(group);
        }

        return objDescriptor;
    }
}
