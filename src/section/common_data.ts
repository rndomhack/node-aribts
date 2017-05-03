import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsDescriptors from "../descriptors";
import TsSectionBase, { Section } from "./base";

export interface CommonData extends Section {
    download_data_id: number;
    original_network_id: number;
    data_type: number;
    descriptors_loop_length: number;
    descriptors: TsDescriptors;
    data_module: Buffer;
}

export default class TsSectionCommonData extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): CommonData {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as CommonData;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.download_data_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.original_network_id = reader.uimsbf(16);
        objSection.data_type = reader.uimsbf(8);
        reader.next(4);    // reserved_future_use
        objSection.descriptors_loop_length = reader.uimsbf(12);
        objSection.descriptors = new TsDescriptors(reader.readBytesRaw(objSection.descriptors_loop_length));
        objSection.data_module = reader.readBytes(3 + objSection.section_length - (reader.position >> 3) - 4);

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getDownloadDataId() {
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

    getOriginalNetworkId() {
        return this._buffer[8] << 8 | this._buffer[9];
    }

    getDataType() {
        return this._buffer[10];
    }
}
