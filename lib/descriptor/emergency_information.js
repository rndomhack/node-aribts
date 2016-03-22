"use strict";

const TsReader = require("../reader");

class TsDescriptorEmergencyInformation {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};
        let pos;

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.services = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let service = {};

            service.service_id = reader.uimsbf(16);
            service.start_end_flag = reader.bslbf(1);
            service.signal_type = reader.bslbf(1);
            reader.next(6);    // undefined
            service.area_code_length = reader.uimsbf(8);
            service.area_codes = [];

            pos = reader.position >> 3;
            while (reader.position >> 3 < pos + objDescriptor.area_code_length) {
                let area_code = {};

                area_code.area_code = reader.uimsbf(12);
                reader.next(4);    // undefined

                service.area_codes.push(area_code);
            }

            objDescriptor.services.push(service);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorEmergencyInformation;
