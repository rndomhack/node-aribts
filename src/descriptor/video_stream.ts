import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface VideoStream extends Descriptor {
    multiple_frame_rate_flag: number;
    frame_rate_code: number;
    MPEG_1_only_flag: number;
    constrained_parameter_flag: number;
    still_picture_flag: number;

    profile_and_level_indication?: number;
    chroma_format?: number;
    frame_rate_extension_flag?: number;
}

export default class TsDescriptorVideoStream extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): VideoStream {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as VideoStream;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.multiple_frame_rate_flag = reader.bslbf(1);
        objDescriptor.frame_rate_code = reader.uimsbf(4);
        objDescriptor.MPEG_1_only_flag = reader.bslbf(1);
        objDescriptor.constrained_parameter_flag = reader.bslbf(1);
        objDescriptor.still_picture_flag = reader.bslbf(1);

        if (objDescriptor.MPEG_1_only_flag === 0) {
            objDescriptor.profile_and_level_indication = reader.uimsbf(8);
            objDescriptor.chroma_format = reader.uimsbf(2);
            objDescriptor.frame_rate_extension_flag = reader.bslbf(1);
            reader.next(5);    // reserved
        }

        return objDescriptor;
    }
}
