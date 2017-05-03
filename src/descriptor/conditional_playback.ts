import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ConditionalPlayback extends Descriptor {
    conditional_playback_id: number;
    conditional_playback_PID: number;
}

export default class TsDescriptorConditionalPlayback extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ConditionalPlayback {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ConditionalPlayback;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.conditional_playback_id = reader.uimsbf(16);
        reader.next(3);    // '111'
        objDescriptor.conditional_playback_PID = reader.uimsbf(13);

        return objDescriptor;
    }
}
