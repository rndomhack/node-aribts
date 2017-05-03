import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsSectionBase, { Section } from "./base";

export interface Emm extends Section {
    private_indicator: number;
    table_id_extension: number;
    messages: Message[];
}

export interface Message {
    card_ID: Buffer;
    associated_information_length: number;
    encrypted_data: Buffer;
}

export default class TsSectionEmm extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): Emm {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as Emm;

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

        objSection.messages = [];

        for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
            const message = {} as any as Message;

            message.card_ID = reader.readBytes(6);
            message.associated_information_length = reader.uimsbf(8);
            message.encrypted_data = reader.readBytes(message.associated_information_length);

            objSection.messages.push(message);
        }

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

    getEmmPayloads(): Buffer[] {
        const sectionLength = this.getSectionLength();
        const payloads: Buffer[] = [];
        let bytesRead = 8;

        for (const l = 3 + sectionLength - 4; bytesRead < l; ) {
            const associatedInformationLength = this._buffer[bytesRead + 6] << 8;
            const length = 7 + associatedInformationLength;

            payloads.push(this._buffer.slice(bytesRead, bytesRead + length));

            bytesRead += length;
        }

        return payloads;
    }
}
