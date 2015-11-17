"use strict";

const TsReader = require("../reader");

class TsDescriptorCompatibility {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.compatibility_descriptor_length = reader.uimsbf(16);
        objDescriptor.descriptor_count = reader.uimsbf(16);
        objDescriptor.descriptors = [];

        for (let i = 0; i < objDescriptor.descriptor_count; i++) {
            let descriptor = {};

            descriptor.descriptor_type = reader.uimsbf(8);
            descriptor.descriptor_length = reader.uimsbf(8);
            descriptor.specifier_type = reader.uimsbf(8);
            descriptor.specifier_data = reader.readBytes(3);
            descriptor.model = reader.uimsbf(16);
            descriptor.version = reader.uimsbf(16);
            descriptor.sub_descriptor_count = reader.uimsbf(8);
            descriptor.sub_descriptors = [];

            for (let j = 0; j < objDescriptor.sub_descriptor_count; j++) {
                let sub_descriptor = {};

                sub_descriptor.sub_descriptor_type = reader.uimsbf(8);
                sub_descriptor.sub_descriptor_length = reader.uimsbf(8);
                sub_descriptor.additionalInformation = reader.readBytes(sub_descriptor.sub_descriptor_length);

                descriptor.sub_descriptors.push(sub_descriptor);
            }

            objDescriptor.descriptors.push(descriptor);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCompatibility;
