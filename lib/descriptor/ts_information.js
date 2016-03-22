"use strict";

const TsReader = require("../reader");

class TsDescriptorTsInformation {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.remote_control_key_id = reader.uimsbf(8);
        objDescriptor.length_of_ts_name = reader.uimsbf(6);
        objDescriptor.transmission_type_count = reader.uimsbf(2);
        objDescriptor.ts_name_char = reader.readBytes(objDescriptor.length_of_ts_name);
        objDescriptor.transmission_types = [];

        for (let i = 0; i < objDescriptor.transmission_type_count; i++) {
            let transmission_type = {};

            transmission_type.transmission_type_info = reader.bslbf(8);
            transmission_type.num_of_service = reader.uimsbf(8);
            transmission_type.services = [];

            for (let j = 0; j < transmission_type.num_of_service; j++) {
                let service = {};

                service.service_id = reader.uimsbf(16);

                transmission_type.services.push(service);
            }

            objDescriptor.transmission_types.push(transmission_type);
        }

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            reader.next(8);    // reserved_future_use
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorTsInformation;
