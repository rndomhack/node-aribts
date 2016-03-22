"use strict";

const TsReader = require("../reader");

class TsDescriptorCaService {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_id = reader.uimsbf(16);
        objDescriptor.ca_broadcaster_group_id = reader.uimsbf(8);
        objDescriptor.message_control = reader.uimsbf(8);
        objDescriptor.services = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let service = {};

            service.service_id = reader.uimsbf(16);

            objDescriptor.services.push(service);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCaService;
