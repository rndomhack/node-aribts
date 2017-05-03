import TsReader from "../reader";
import TsSectionBase, { Section } from "./base";

export interface DiscontinuityInformation extends Section {
    transition_flag: number;
}

export default class TsSectionDiscontinuityInformation extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): DiscontinuityInformation {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as DiscontinuityInformation;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // Reserved
        objSection.section_length = reader.uimsbf(12);

        objSection.transition_flag = reader.uimsbf(1);

        return objSection;
    }
}
