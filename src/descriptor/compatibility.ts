import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Compatibility extends Descriptor {
    compatibilityDescriptorLength: number;
    descriptorCount: number;
    descriptors: CompatibilityDescriptor[];
}

export interface CompatibilityDescriptor {
    descriptorType: number;
    descriptorLength: number;
    specifierType: number;
    specifierData: Buffer;
    model: number;
    version: number;
    subDescriptorCount: number;
    subDescriptors: CompatibilitySubDescriptor[];
}

export interface CompatibilitySubDescriptor {
    subDescriptorType: number;
    subDescriptorLength: number;
    additionalInformation: Buffer;
}

export default class TsDescriptorCompatibility extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Compatibility {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Compatibility;

        objDescriptor.compatibilityDescriptorLength = reader.uimsbf(16);
        objDescriptor.descriptorCount = reader.uimsbf(16);
        objDescriptor.descriptors = [];

        for (let i = 0; i < objDescriptor.descriptorCount; i++) {
            const descriptor = {} as any as CompatibilityDescriptor;

            descriptor.descriptorType = reader.uimsbf(8);
            descriptor.descriptorLength = reader.uimsbf(8);
            descriptor.specifierType = reader.uimsbf(8);
            descriptor.specifierData = reader.readBytes(3);
            descriptor.model = reader.uimsbf(16);
            descriptor.version = reader.uimsbf(16);
            descriptor.subDescriptorCount = reader.uimsbf(8);
            descriptor.subDescriptors = [];

            for (let j = 0; j < descriptor.subDescriptorCount; j++) {
                const subDescriptor = {} as any as CompatibilitySubDescriptor;

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
