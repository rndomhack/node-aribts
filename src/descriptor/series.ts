import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Series extends Descriptor {
    series_id: number;
    repeat_label: number;
    program_pattern: number;
    expire_date_valid_flag: number;
    expire_date: number;
    episode_number: number;
    last_episode_number: number;
    series_name: Buffer;
}

export default class TsDescriptorSeries extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Series {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Series;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.series_id = reader.uimsbf(16);
        objDescriptor.repeat_label = reader.uimsbf(4);
        objDescriptor.program_pattern = reader.uimsbf(3);
        objDescriptor.expire_date_valid_flag = reader.uimsbf(1);
        objDescriptor.expire_date = reader.uimsbf(16);
        objDescriptor.episode_number = reader.uimsbf(12);
        objDescriptor.last_episode_number = reader.uimsbf(12);
        objDescriptor.series_name = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
