"use strict";

const tsCarouselDescriptorList = require("./carousel_descriptor");

class TsCarouselDescriptors {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        const tsCarouselDescriptors = [];

        for (let bytesRead = 0, l = this.buffer.length; bytesRead < l; ) {
            let tsCarouselDescriptor;

            const descriptorTag = this.buffer[bytesRead++];
            const descriptorLength = this.buffer[bytesRead++];

            const buffer = this.buffer.slice(bytesRead - 2, bytesRead + descriptorLength);
            bytesRead += descriptorLength;

            switch (descriptorTag) {
                case 0x01: {
                    // Type
                    tsCarouselDescriptor = new tsCarouselDescriptorList.TsCarouselDescriptorType(buffer);

                    break;
                }

                case 0x02: {
                    // Name
                    tsCarouselDescriptor = new tsCarouselDescriptorList.TsCarouselDescriptorName(buffer);

                    break;
                }

                case 0x03: {
                    // Info
                    tsCarouselDescriptor = new tsCarouselDescriptorList.TsCarouselDescriptorInfo(buffer);

                    break;
                }

                case 0x04: {
                    // Module link
                    tsCarouselDescriptor = new tsCarouselDescriptorList.TsCarouselDescriptorModuleLink(buffer);

                    break;
                }

                case 0x05: {
                    // CRC32
                    tsCarouselDescriptor = new tsCarouselDescriptorList.TsCarouselDescriptorCrc32(buffer);

                    break;
                }

                default: {
                    // Unknown
                    tsCarouselDescriptor = new tsCarouselDescriptorList.TsCarouselDescriptorBase(buffer);
                }
            }

            tsCarouselDescriptors.push(tsCarouselDescriptor);
        }

        return tsCarouselDescriptors;
    }
}

module.exports = TsCarouselDescriptors;
