import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsDescriptorCompatibility from "../descriptor/compatibility";
import TsCarouselDescriptors from "../carousel_descriptors";
import TsSectionBase, { Section } from "./base";

export interface Dsmcc extends Section {
    private_indicator: number;
    table_id_extension: number;
    userNetworkMessage?: TsDsmccMessageDownloadInfoIndication;
    downloadDataMessage?: TsDsmccMessageDownloadDataBlock;
    stream_descriptor?: Buffer;
    private_data?: Buffer;
    Checksum?: Buffer;
}

export interface MessageDownloadInfoIndication {
    protocolDiscriminator: number;
    dsmccType: number;
    messageId: number;
    transactionId: number;
    adaptationLength: number;
    messageLength: number;
    adaptationType?: number;
    adaptationDataByte?: Buffer;
    downloadId: number;
    blockSize: number;
    windowSize: number;
    ackPeriod: number;
    tCDownloadWindow: number;
    tCDownloadScenario: number;
    compatibilityDescriptor: TsDescriptorCompatibility;
    numberOfModules: number;
    modules: MessageDownloadInfoIndicationModule[];
    privateDataLength: number;
    privateData: TsCarouselDescriptors;
}

export interface MessageDownloadInfoIndicationModule {
    moduleId: number;
    moduleSize: number;
    moduleVersion: number;
    moduleInfoLength: number;
    moduleInfo: TsCarouselDescriptors;
}

export interface MessageDownloadDataBlock {
    protocolDiscriminator: number;
    dsmccType: number;
    messageId: number;
    downloadId: number;
    adaptationLength: number;
    messageLength: number;
    adaptationType?: number;
    adaptationDataByte?: Buffer;
    moduleId: number;
    moduleVersion: number;
    blockNumber: number;
    blockDataByte: Buffer;
}

export class TsDsmccMessageDownloadInfoIndication {
    _buffer: Buffer;

    constructor(buffer) {
        this._buffer = buffer;
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objMessage = {} as any as MessageDownloadInfoIndication;

        objMessage.protocolDiscriminator = reader.uimsbf(8);
        objMessage.dsmccType = reader.uimsbf(8);
        objMessage.messageId = reader.uimsbf(16);
        objMessage.transactionId = reader.uimsbf(32);
        reader.next(8);    // reserved
        objMessage.adaptationLength = reader.uimsbf(8);
        objMessage.messageLength = reader.uimsbf(16);

        if (objMessage.adaptationLength > 0) {
            objMessage.adaptationType = reader.uimsbf(8);
            objMessage.adaptationDataByte = reader.readBytes(objMessage.adaptationLength - 1);
        }

        objMessage.downloadId = reader.uimsbf(32);
        objMessage.blockSize = reader.uimsbf(16);
        objMessage.windowSize = reader.uimsbf(8);
        objMessage.ackPeriod = reader.uimsbf(8);
        objMessage.tCDownloadWindow = reader.uimsbf(32);
        objMessage.tCDownloadScenario = reader.uimsbf(32);

        const descriptorLength = (reader.buffer[reader.position >> 3] << 8) | reader.buffer[(reader.position >> 3) + 1];
        objMessage.compatibilityDescriptor = new TsDescriptorCompatibility(reader.readBytesRaw(2 + descriptorLength));

        objMessage.numberOfModules = reader.uimsbf(16);
        objMessage.modules = [];

        for (let i = 0; i < objMessage.numberOfModules; i++) {
            const module = {} as any as MessageDownloadInfoIndicationModule;

            module.moduleId = reader.uimsbf(16);
            module.moduleSize = reader.uimsbf(32);
            module.moduleVersion = reader.uimsbf(8);
            module.moduleInfoLength = reader.uimsbf(8);
            module.moduleInfo = new TsCarouselDescriptors(reader.readBytesRaw(module.moduleInfoLength));

            objMessage.modules.push(module);
        }

        objMessage.privateDataLength = reader.uimsbf(16);
        objMessage.privateData = new TsCarouselDescriptors(reader.readBytesRaw(objMessage.privateDataLength));

        return objMessage;
    }
}

export class TsDsmccMessageDownloadDataBlock {
    _buffer: Buffer;

    constructor(buffer) {
        this._buffer = buffer;
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objMessage = {} as any as MessageDownloadDataBlock;

        objMessage.protocolDiscriminator = reader.uimsbf(8);
        objMessage.dsmccType = reader.uimsbf(8);
        objMessage.messageId = reader.uimsbf(16);
        objMessage.downloadId = reader.uimsbf(32);
        reader.next(8);    // reserved
        objMessage.adaptationLength = reader.uimsbf(8);
        objMessage.messageLength = reader.uimsbf(16);

        if (objMessage.adaptationLength > 0) {
            objMessage.adaptationType = reader.uimsbf(8);
            objMessage.adaptationDataByte = reader.readBytes(objMessage.adaptationLength - 1);
        }

        objMessage.moduleId = reader.uimsbf(16);
        objMessage.moduleVersion = reader.uimsbf(8);
        reader.next(8);    // reserved
        objMessage.blockNumber = reader.uimsbf(16);
        objMessage.blockDataByte = reader.readBytes(objMessage.messageLength - objMessage.adaptationLength - 6);

        return objMessage;
    }
}

export default class TsSectionDsmcc extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): Dsmcc {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as Dsmcc;

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

        const buffer = reader.readBytes(3 + objSection.section_length - (reader.position >> 3) - 4);

        switch (objSection.table_id) {
            case 0x3B:
                objSection.userNetworkMessage = new TsDsmccMessageDownloadInfoIndication(buffer);

                break;

            case 0x3C:
                objSection.downloadDataMessage = new TsDsmccMessageDownloadDataBlock(buffer);

                break;

            case 0x3D:
                objSection.stream_descriptor = buffer;

                break;

            case 0x3E:
                objSection.private_data = buffer;

                break;
        }

        if (objSection.section_syntax_indicator === 0) {
            objSection.Checksum = reader.readBytes(4);
        } else {
            objSection.CRC_32 = reader.readBytes(4);
        }

        return objSection;
    }

    checkCrc32() {
        return this._buffer[1] >> 7 === 0 || TsCrc32.calc(this._buffer) === 0;
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
}
