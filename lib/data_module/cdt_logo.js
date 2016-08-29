"use strict";

const TsReader = require("../reader");

class TsDataModuleCdtLogo {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDataModule = {};

        objDataModule.logo_type = reader.uimsbf(8);
        reader.next(7);    // reserved_future_use
        objDataModule.logo_id = reader.uimsbf(9);
        reader.next(4);    // reserved_future_use
        objDataModule.logo_version = reader.uimsbf(12);
        objDataModule.data_size = reader.uimsbf(16);
        objDataModule.data_byte = reader.readBytes(objDataModule.data_size);

        return objDataModule;
    }
}

module.exports = TsDataModuleCdtLogo;
