import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsDescriptors from "../descriptors";
import TsSectionBase, { Section } from "./base";

export interface TimeOffset extends Section {
    JST_time: Buffer;
    descriptors_loop_length: number;
    descriptors: TsDescriptors;
}

export default class TsSectionTimeOffset extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): TimeOffset {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as TimeOffset;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);

        objSection.JST_time = reader.readBytes(5);
        reader.next(4);    // reserved
        objSection.descriptors_loop_length = reader.uimsbf(12);
        objSection.descriptors = new TsDescriptors(reader.readBytesRaw(objSection.descriptors_loop_length));

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this._buffer) === 0;
    }
}
