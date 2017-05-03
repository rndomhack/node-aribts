import TsReader from "../reader";
import TsCarouselDescriptorBase, { Descriptor } from "./base";

export interface ModuleLink extends Descriptor {
    position: number;
    moduleId: number;
}

export default class TsCarouselDescriptorModuleLink extends TsCarouselDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ModuleLink {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ModuleLink;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.position = reader.uimsbf(8);
        objDescriptor.moduleId = reader.uimsbf(16);

        return objDescriptor;
    }
}
