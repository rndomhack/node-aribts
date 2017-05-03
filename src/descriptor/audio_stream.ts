import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface AudioStream extends Descriptor {
    free_format_flag: number;
    ID: number;
    layer: number;
    variable_rate_audio_indicator: number;
}

export default class TsDescriptorAudioStream extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): AudioStream {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as AudioStream;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.free_format_flag = reader.bslbf(1);
        objDescriptor.ID = reader.bslbf(1);
        objDescriptor.layer = reader.bslbf(2);
        objDescriptor.variable_rate_audio_indicator = reader.bslbf(1);
        reader.next(3);    // reserved

        return objDescriptor;
    }
}
