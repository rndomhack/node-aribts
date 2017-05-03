import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsDescriptors from "../descriptors";
import TsSectionBase, { Section } from "./base";

export interface ServiceDescription extends Section {
    original_network_id: number;
    services: Service[];
}

export interface Service {
    service_id: number;
    EIT_user_defined_flags: number;
    EIT_schedule_flag: number;
    EIT_present_following_flag: number;
    running_status: number;
    free_CA_mode: number;
    descriptors_loop_length: number;
    descriptors: TsDescriptors;
}

export default class TsSectionServiceDescription extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): ServiceDescription {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as ServiceDescription;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // reserved_future_use
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.transport_stream_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.original_network_id = reader.uimsbf(16);
        reader.next(8);    // reserved_future_use
        objSection.services = [];

        for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
            const service = {} as any as Service;

            service.service_id = reader.uimsbf(16);
            reader.next(3);    // reserved_future_use
            service.EIT_user_defined_flags = reader.bslbf(3);
            service.EIT_schedule_flag = reader.bslbf(1);
            service.EIT_present_following_flag = reader.bslbf(1);
            service.running_status = reader.uimsbf(3);
            service.free_CA_mode = reader.bslbf(1);
            service.descriptors_loop_length = reader.uimsbf(12);
            service.descriptors = new TsDescriptors(reader.readBytesRaw(service.descriptors_loop_length));

            objSection.services.push(service);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    checkCrc32() {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getTransportStreamId() {
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
}
