import Type from "./carousel_descriptor/type";
import Name from "./carousel_descriptor/name";
import Info from "./carousel_descriptor/info";
import ModuleLink from "./carousel_descriptor/module_link";
import Crc32 from "./carousel_descriptor/crc32";
import Base from "./carousel_descriptor/base";

export type TsCarouselDescriptor = (
    Type |
    Name |
    Info |
    ModuleLink |
    Crc32 |
    Base
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
                    tsCarouselDescriptor = new Type(buffer);

                    break;
                }

                case 0x02: {
                    // Name
                    tsCarouselDescriptor = new Name(buffer);

                    break;
                }

                case 0x03: {
                    // Info
                    tsCarouselDescriptor = new Info(buffer);

                    break;
                }

                case 0x04: {
                    // Module link
                    tsCarouselDescriptor = new ModuleLink(buffer);

                    break;
                }

                case 0x05: {
                    // CRC32
                    tsCarouselDescriptor = new Crc32(buffer);

                    break;
                }

                default: {
                    // Unknown
                    tsCarouselDescriptor = new Base(buffer);
                }
            }

            tsCarouselDescriptors.push(tsCarouselDescriptor);
        }

        return tsCarouselDescriptors;
    }
}
