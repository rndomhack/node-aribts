"use strict";

const TsReader = require("../reader");

class TsDescriptorServiceGroup {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.service_group_type = reader.uimsbf(4);
        reader.next(4);    // reserved_future_use

        if (objDescriptor.service_group_type === 1) {
            objDescriptor.service_groups = [];

            while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                let service_group = {};

                service_group.primary_service_id = reader.uimsbf(16);
                service_group.secondary_service_id = reader.uimsbf(16);

                objDescriptor.service_groups.push(service_group);
            }
        } else {
            objDescriptor.private_data_byte = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorServiceGroup;
