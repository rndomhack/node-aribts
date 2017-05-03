import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsDescriptors from "../descriptors";
import TsSectionBase, { Section } from "./base";

export interface ProgramMap extends Section {
    program_number: number;
    PCR_PID: number;
    program_info_length: number;
    program_info: TsDescriptors;
    streams: Stream[];
}

export interface Stream {
    stream_type: number;
    elementary_PID: number;
    ES_info_length: number;
    ES_info: TsDescriptors;
}

export default class TsSectionProgramMap extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): ProgramMap {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as ProgramMap;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // '0'
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.program_number = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        reader.next(3);    // reserved
        objSection.PCR_PID = reader.uimsbf(13);
        reader.next(4);    // reserved
        objSection.program_info_length = reader.uimsbf(12);
        objSection.program_info = new TsDescriptors(reader.readBytesRaw(objSection.program_info_length));

        objSection.streams = [];

        for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
            const stream = {} as any as Stream;

            stream.stream_type = reader.uimsbf(8);
            reader.next(3);    // reserved
            stream.elementary_PID = reader.uimsbf(13);
            reader.next(4);    // reserved
            stream.ES_info_length = reader.uimsbf(12);
            stream.ES_info = new TsDescriptors(reader.readBytesRaw(stream.ES_info_length));

            objSection.streams.push(stream);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32(): boolean {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getProgramNumber(): number {
        return this._buffer[3] << 8 | this._buffer[4];
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
