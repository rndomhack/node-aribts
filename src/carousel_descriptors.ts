import * as index from "./carousel_descriptor/index";

export type TsCarouselDescriptor = (
    index.TsCarouselDescriptorType |
    index.TsCarouselDescriptorName |
    index.TsCarouselDescriptorInfo |
    index.TsCarouselDescriptorModuleLink |
    index.TsCarouselDescriptorCrc32 |
    index.TsCarouselDescriptorBase
);

export default class TsCarouselDescriptors {
    buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    decode(): TsCarouselDescriptor[] {
        const tsCarouselDescriptors: TsCarouselDescriptor[] = [];

        for (let bytesRead = 0, l = this.buffer.length; bytesRead < l; ) {
            let tsCarouselDescriptor: TsCarouselDescriptor;

            const descriptorTag = this.buffer[bytesRead++];
            const descriptorLength = this.buffer[bytesRead++];

            const buffer = this.buffer.slice(bytesRead - 2, bytesRead + descriptorLength);
            bytesRead += descriptorLength;

            switch (descriptorTag) {
                case 0x01: {
                    // Type
                    tsCarouselDescriptor = new index.TsCarouselDescriptorType(buffer);

                    break;
                }

                case 0x02: {
                    // Name
                    tsCarouselDescriptor = new index.TsCarouselDescriptorName(buffer);

                    break;
                }

                case 0x03: {
                    // Info
                    tsCarouselDescriptor = new index.TsCarouselDescriptorInfo(buffer);

                    break;
                }

                case 0x04: {
                    // Module link
                    tsCarouselDescriptor = new index.TsCarouselDescriptorModuleLink(buffer);

                    break;
                }

                case 0x05: {
                    // CRC32
                    tsCarouselDescriptor = new index.TsCarouselDescriptorCrc32(buffer);

                    break;
                }

                default: {
                    // Unknown
                    tsCarouselDescriptor = new index.TsCarouselDescriptorBase(buffer);
                }
            }

            tsCarouselDescriptors.push(tsCarouselDescriptor);
        }

        return tsCarouselDescriptors;
    }
}
