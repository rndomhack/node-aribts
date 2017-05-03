import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface LocalTimeOffset extends Descriptor {
    local_time_offsets: Offset[];
}

export interface Offset {
    country_code: Buffer;
    country_region_id: number;
    local_time_offset_polarity: number;
    local_time_offset: Buffer;
    time_of_change: Buffer;
    next_time_offset: Buffer;
}

export default class TsDescriptorLocalTimeOffset extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): LocalTimeOffset {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as LocalTimeOffset;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.local_time_offsets = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const local_time_offset = {} as any as Offset;

            local_time_offset.country_code = reader.readBytes(3);
            local_time_offset.country_region_id = reader.bslbf(6);
            reader.next(1);    // reserved
            local_time_offset.local_time_offset_polarity = reader.bslbf(1);
            local_time_offset.local_time_offset = reader.readBytes(2);
            local_time_offset.time_of_change = reader.readBytes(5);
            local_time_offset.next_time_offset = reader.readBytes(2);

            objDescriptor.local_time_offsets.push(local_time_offset);
        }

        return objDescriptor;
    }
}
