"use strict";

const TsCrc32 = require("../crc32");
const TsReader = require("../reader");
const TsDescriptorCompatibility = require("../descriptor/compatibility");
const TsModuleDescriptors = require("../module_descriptors");

class TsDsmccMessageDownloadInfoIndication {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDii = {};

        objDii.protocolDiscriminator = reader.uimsbf(8);
        objDii.dsmccType = reader.uimsbf(8);
        objDii.messageId = reader.uimsbf(16);
        objDii.transaction_id = reader.uimsbf(32);
        reader.next(8);    // reserved
        objDii.adaptationLength = reader.uimsbf(8);
        objDii.messageLength = reader.uimsbf(16);

        if (objDii.adaptationLength > 0) {
            objDii.adaptationType = reader.uimsbf(8);
            objDii.adaptationDataByte = reader.readBytes(objDii.adaptationLength - 1);
        }

        objDii.downloadId = reader.uimsbf(32);
        objDii.blockSize = reader.uimsbf(16);
        objDii.windowSize = reader.uimsbf(8);
        objDii.ackPeriod = reader.uimsbf(8);
        objDii.tCDownloadWindow = reader.uimsbf(32);
        objDii.tCDownloadScenario = reader.uimsbf(32);

        let descriptorLength = (reader.buffer[reader.position >> 3] << 8) | reader.buffer[(reader.position >> 3) + 1];
        objDii.compatibilityDescriptor = new TsDescriptorCompatibility(reader.readBytesRaw(2 + descriptorLength)).decode();

        objDii.numberOfModules = reader.uimsbf(16);
        objDii.modules = [];

        for (let i = 0; i < objDii.numberOfModules; i++) {
            let module = {};

            module.moduleId = reader.uimsbf(16);
            module.moduleSize = reader.uimsbf(32);
            module.moduleVersion = reader.uimsbf(8);
            module.moduleInfoLength = reader.uimsbf(8);
            module.moduleInfo = new TsModuleDescriptors(reader.readBytesRaw(module.moduleInfoLength)).decode();

            objDii.modules.push(module);
        }

        objDii.privateDataLength = reader.uimsbf(16);
        objDii.privateData = new TsModuleDescriptors(reader.readBytesRaw(objDii.privateDataLength)).decode();

        return objDii;
    }
}

class TsDsmccMessageDownloadDataBlock {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDdb = {};

        objDdb.protocolDiscriminator = reader.uimsbf(8);
        objDdb.dsmccType = reader.uimsbf(8);
        objDdb.messageId = reader.uimsbf(16);
        objDdb.downloadId = reader.uimsbf(32);
        reader.next(8);    // reserved
        objDdb.adaptationLength = reader.uimsbf(8);
        objDdb.messageLength = reader.uimsbf(16);

        if (objDdb.adaptationLength > 0) {
            objDdb.adaptationType = reader.uimsbf(8);
            objDdb.adaptationDataByte = reader.readBytes(objDdb.adaptationLength - 1);
        }

        objDdb.moduleId = reader.uimsbf(16);
        objDdb.moduleVersion = reader.uimsbf(8);
        reader.next(8);    // reserved
        objDdb.blockNumber = reader.uimsbf(16);
        objDdb.blockDataByte = reader.readBytes(objDdb.messageLength - objDdb.adaptationLength - 6);

        return objDdb;
    }
}

class TsTableDsmcc {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        if (this.buffer[1] >> 7 === 1 && TsCrc32.calc(this.buffer) !== 0) return null;

        let reader = new TsReader(this.buffer);
        let objDsmcc = {};

        objDsmcc._raw = this.buffer;

        objDsmcc.table_id = reader.uimsbf(8);
        objDsmcc.section_syntax_indicator = reader.bslbf(1);
        objDsmcc.private_indicator = reader.bslbf(1);
        reader.next(2);    // reserved
        objDsmcc.dsmcc_section_length = reader.uimsbf(12);
        objDsmcc.table_id_extension = reader.uimsbf(16);
        reader.next(2);    // reserved
        objDsmcc.version_number = reader.uimsbf(5);
        objDsmcc.current_next_indicator = reader.bslbf(1);
        objDsmcc.section_number = reader.uimsbf(8);
        objDsmcc.last_section_number = reader.uimsbf(8);

        let buffer = reader.readBytes(3 + objDsmcc.dsmcc_section_length - (reader.position >> 3) - 4);
        if (objDsmcc.table_id === 0x3B) {
            objDsmcc.message = new TsDsmccMessageDownloadInfoIndication(buffer).decode();
        } else if (objDsmcc.table_id === 0x3C) {
            objDsmcc.message = new TsDsmccMessageDownloadDataBlock(buffer).decode();
        } else if (objDsmcc.table_id === 0x3D) {
            objDsmcc.stream_descriptor = buffer;
        } else if (objDsmcc.table_id === 0x3E) {
            objDsmcc.private_data_byte = buffer;
        }

        if (objDsmcc.section_syntax_indicator === 0) {
            objDsmcc.Checksum = reader.readBytes(4);
        } else {
            objDsmcc.CRC_32 = reader.readBytes(4);
        }

        return objDsmcc;
    }
}

module.exports = TsTableDsmcc;
