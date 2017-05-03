import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface AudioComponent extends Descriptor {
    stream_content: number;
    component_type: number;
    component_tag: number;
    stream_type: number;
    simulcast_group_tag: number;
    ES_multi_lingual_flag: number;
    main_component_flag: number;
    quality_indicator: number;
    sampling_rate: number;
    ISO_639_language_code: Buffer;
    ISO_639_language_code_2?: Buffer;
    text: Buffer;
}

export default class TsDescriptorAudioComponent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): AudioComponent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as AudioComponent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        reader.next(4);    // reserved_future_use
        objDescriptor.stream_content = reader.uimsbf(4);
        objDescriptor.component_type = reader.uimsbf(8);
        objDescriptor.component_tag = reader.uimsbf(8);
        objDescriptor.stream_type = reader.uimsbf(8);
        objDescriptor.simulcast_group_tag = reader.bslbf(8);
        objDescriptor.ES_multi_lingual_flag = reader.bslbf(1);
        objDescriptor.main_component_flag = reader.bslbf(1);
        objDescriptor.quality_indicator = reader.bslbf(2);
        objDescriptor.sampling_rate = reader.uimsbf(3);
        reader.next(1);    // reserved_future_use
        objDescriptor.ISO_639_language_code = reader.readBytes(3);

        if (objDescriptor.ES_multi_lingual_flag === 1) {
            objDescriptor.ISO_639_language_code_2 = reader.readBytes(3);
        }

        objDescriptor.text = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}
