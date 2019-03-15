"use strict";

const TsReader = require("../reader");

class TsDataModuleLogo {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDataModule = {};

        objDataModule.logo_type = reader.uimsbf(8);
        objDataModule.number_of_loop = reader.uimsbf(16);
        objDataModule.logos = [];

        for (let i = 0; i < objDataModule.number_of_loop; i++) {
            let logo = {};

            reader.next(7);    // reserved
            logo.logo_id = reader.uimsbf(9);
            logo.number_of_services = reader.uimsbf(8);
            logo.services = [];

            for (let j = 0; j < logo.number_of_services; j++) {
                let service = {};

                service.original_network_id = reader.uimsbf(16);
                service.transport_stream_id = reader.uimsbf(16);
                service.service_id = reader.uimsbf(16);

                logo.services.push(service);
            }

            logo.data_size = reader.uimsbf(16);
            logo.data_byte = reader.readBytes(logo.data_size);

            objDataModule.logos.push(logo);
        }

        return objDataModule;
    }
}

module.exports = TsDataModuleLogo;
