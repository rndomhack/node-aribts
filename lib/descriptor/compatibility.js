"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorCompatibility extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.compatibilityDescriptorLength = reader.uimsbf(16);
        objDescriptor.descriptorCount = reader.uimsbf(16);
        objDescriptor.descriptors = [];

        for (let i = 0; i < objDescriptor.descriptorCount; i++) {
            const descriptor = {};

            descriptor.descriptorType = reader.uimsbf(8);
            descriptor.descriptorLength = reader.uimsbf(8);
            descriptor.specifierType = reader.uimsbf(8);
            descriptor.specifierData = reader.readBytes(3);
            descriptor.model = reader.uimsbf(16);
            descriptor.version = reader.uimsbf(16);
            descriptor.subDescriptorCount = reader.uimsbf(8);
            descriptor.subDescriptors = [];

            for (let j = 0; j < objDescriptor.subDescriptorCount; j++) {
                const subDescriptor = {};

                subDescriptor.subDescriptorType = reader.uimsbf(8);
                subDescriptor.subDescriptorLength = reader.uimsbf(8);
                subDescriptor.additionalInformation = reader.readBytes(subDescriptor.subDescriptorLength);

                descriptor.subDescriptors.push(subDescriptor);
            }

            objDescriptor.descriptors.push(descriptor);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCompatibility;
