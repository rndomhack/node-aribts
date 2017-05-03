import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsDescriptors from "../descriptors";
import TsSectionBase, { Section } from "./base";

export interface ConditionalAccess extends Section {
    descriptors: TsDescriptors;
}

export default class TsSectionConditionalAccess extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): ConditionalAccess {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as ConditionalAccess;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // '0'
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        reader.next(18);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.descriptors = new TsDescriptors(reader.readBytesRaw(3 + objSection.section_length - (reader.position >> 3) - 4));

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32(): boolean {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getVersionNumber(): number {
        return (this._buffer[5] & 0x3E) >> 1;
    }

    getCurrentNextIndicator(): number {
        return this._buffer[5] & 0x01;
    }

    getSectionNumber(): number {
        return this._buffer[6];
    }

    getLastSectionNumber(): number {
        return this._buffer[7];
    }
}
