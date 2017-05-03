import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsSectionBase, { Section } from "./base";

export interface Ecm extends Section {
    private_indicator: number;
    table_id_extension: number;
    protocol_number: number;
    ca_broadcaster_group_ID: number;
    work_key_ID: number;
    encrypted_data: Buffer;
}

export default class TsSectionEcm extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): Ecm {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as Ecm;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        objSection.private_indicator = reader.bslbf(1);
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.table_id_extension = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.protocol_number = reader.uimsbf(8);
        objSection.ca_broadcaster_group_ID = reader.uimsbf(8);
        objSection.work_key_ID = reader.uimsbf(8);
        objSection.encrypted_data = reader.readBytes(3 + objSection.section_length - (reader.position >> 3) - 4);

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getTableIdExtension() {
        return this._buffer[3] << 8 | this._buffer[4];
    }

    getVersionNumber() {
        return (this._buffer[5] & 0x3E) >> 1;
    }

    getCurrentNextIndicator() {
        return this._buffer[5] & 0x01;
    }

    getSectionNumber() {
        return this._buffer[6];
    }

    getLastSectionNumber() {
        return this._buffer[7];
    }

    getEcmPayload(): Buffer {
        const sectionLength = this.getSectionLength();

        return this._buffer.slice(8, 3 + sectionLength - 4);
    }
}
