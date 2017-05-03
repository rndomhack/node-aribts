import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface VideoDecodeControl extends Descriptor {
    still_picture_flag: number;
    sequence_end_code_flag: number;
    video_encode_format: number;
}

export default class TsDescriptorVideoDecodeControl extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): VideoDecodeControl {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as VideoDecodeControl;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.still_picture_flag = reader.bslbf(1);
        objDescriptor.sequence_end_code_flag = reader.bslbf(1);
        objDescriptor.video_encode_format = reader.bslbf(4);
        reader.next(2);    // reserved_future_use

        return objDescriptor;
    }
}
