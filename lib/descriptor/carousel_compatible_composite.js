"use strict";

const TsReader = require("../reader");

class TsSubdescriptorAccumulationRoot {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.subdescriptor_tag = reader.uimsbf(8);
        objDescriptor.subdescriptor_length = reader.uimsbf(8);

        reader.next(8);    // reserved
        objDescriptor.directory_name_char = reader.readBytes(2 + objDescriptor.subdescriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

class TsSubdescriptorSubdirectory {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.subdescriptor_tag = reader.uimsbf(8);
        objDescriptor.subdescriptor_length = reader.uimsbf(8);

        objDescriptor.subdirectory_name_char = reader.readBytes(2 + objDescriptor.subdescriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

class TsSubdescriptorAccumulationName {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.subdescriptor_tag = reader.uimsbf(8);
        objDescriptor.subdescriptor_length = reader.uimsbf(8);

        objDescriptor.accumulation_name = reader.readBytes(2 + objDescriptor.subdescriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

class TsDescriptorCarouselCompatibleComposite {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.subdescriptors = [];

        while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
            let descriptor;
            let descriptorTag = reader.buffer[reader.position >> 3] << 8;
            let descriptorLength = reader.buffer[(reader.position >> 3) + 1] << 8;
            let buffer = reader.readBytesRaw(2 + descriptorLength);

            switch (descriptorTag) {
                case 0x02:
                    descriptor = new TsSubdescriptorAccumulationName(buffer).decode();
                    break;

                case 0xC5:
                    descriptor = new TsSubdescriptorAccumulationRoot(buffer).decode();
                    break;

                case 0xC6:
                    descriptor = new TsSubdescriptorSubdirectory(buffer).decode();
                    break;
            }

            objDescriptor.subdescriptors.push(descriptor);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorCarouselCompatibleComposite;
