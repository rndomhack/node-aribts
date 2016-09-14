"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptorCompatibility = require("../descriptor/compatibility");
const TsCarouselDescriptors = require("../carousel_descriptors");
const TsSectionBase = require("./base");

class TsDsmccMessageDownloadInfoIndication {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objMessage = {};

        objMessage.protocolDiscriminator = reader.uimsbf(8);
        objMessage.dsmccType = reader.uimsbf(8);
        objMessage.messageId = reader.uimsbf(16);
        objMessage.transaction_id = reader.uimsbf(32);
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
            const module = {};

            module.moduleId = reader.uimsbf(16);
            module.moduleSize = reader.uimsbf(32);
            module.moduleVersion = reader.uimsbf(8);
            module.moduleInfoLength = reader.uimsbf(8);
            module.moduleInfoByte = new TsCarouselDescriptors(reader.readBytesRaw(module.moduleInfoLength));

            objMessage.modules.push(module);
        }

        objMessage.privateDataLength = reader.uimsbf(16);
        objMessage.privateDataByte = new TsCarouselDescriptors(reader.readBytesRaw(objMessage.privateDataLength));

        return objMessage;
    }
}

class TsDsmccMessageDownloadDataBlock {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objMessage = {};

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

class TsSectionDsmcc extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objSection = {};

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

        const buffer = reader.readBytes(3 + objSection.dsmcc_section_length - (reader.position >> 3) - 4);

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
        return this.buffer[1] >> 7 === 0 || TsCrc32.calc(this.buffer) === 0;
    }

    getTableIdExtension() {
        return this.buffer[3] << 8 | this.buffer[4];
    }

    getVersionNumber() {
        return (this.buffer[5] & 0x3E) >> 1;
    }

    getCurrentNextIndicator() {
        return this.buffer[5] & 0x01;
    }

    getSectionNumber() {
        return this.buffer[6];
    }

    getLastSectionNumber() {
        return this.buffer[7];
    }
}

module.exports = TsSectionDsmcc;
