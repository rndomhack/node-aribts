"use strict";

const TsReader = require("../reader");

class TsDataModuleKeywordTable {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDataModule = {};

        objDataModule.number_of_loop = reader.uimsbf(8);
        objDataModule.keyword_tables = [];

        for (let i = 0; i < objDataModule.number_of_loop; i++) {
            const keyword_table = {};

            keyword_table.name_length = reader.uimsbf(8);
            keyword_table.name = reader.readBytes(objDataModule.name_length);

            objDataModule.keyword_tables.push(keyword_table);
        }

        return objDataModule;
    }
}

module.exports = TsDataModuleKeywordTable;
