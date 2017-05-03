import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ScrambleSystem extends Descriptor {
    scramble_system_id: number;
}

export default class TsDescriptorScrambleSystem extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ScrambleSystem {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ScrambleSystem;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.scramble_system_id = reader.uimsbf(8);

        return objDescriptor;
    }
}
