import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsSectionBase, { Section } from "./base";

export interface TimeAndDate extends Section {
    JST_time: Buffer;
}

export default class TsSectionTimeAndDate extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): TimeAndDate {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as TimeAndDate;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);

        objSection.JST_time = reader.readBytes(5);

        return objSection;
    }
}
