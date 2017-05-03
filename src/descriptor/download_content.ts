import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";
import TsDescriptorCompatibility from "./compatibility";
import TsCarouselDescriptors from "../carousel_descriptors";

export interface DownloadContent extends Descriptor {
    reboot: number;
    add_on: number;
    compatibility_flag: number;
    module_info_flag: number;
    text_info_flag: number;
    component_size: number;
    download_id: number;
    time_out_value_DII: number;
    leak_rate: number;
    component_tag: number;
    compatibilityDescriptor: TsDescriptorCompatibility;
    num_of_modules?: number;
    modules?: Module[];
    private_data_length: number;
    private_data: Buffer;
    ISO_639_language_code?: Buffer;
    text_length?: number;
    text?: Buffer;
}

export interface Module {
    module_id: number;
    module_size: number;
    module_info_length: number;
    module_info: TsCarouselDescriptors;
}

export default class TsDescriptorDownloadContent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): DownloadContent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as DownloadContent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reboot = reader.bslbf(1);
        objDescriptor.add_on = reader.bslbf(1);
        objDescriptor.compatibility_flag = reader.bslbf(1);
        objDescriptor.module_info_flag = reader.bslbf(1);
        objDescriptor.text_info_flag = reader.bslbf(1);
        reader.next(3);    // reserved
        objDescriptor.component_size = reader.uimsbf(32);
        objDescriptor.download_id = reader.uimsbf(32);
        objDescriptor.time_out_value_DII = reader.uimsbf(32);
        objDescriptor.leak_rate = reader.uimsbf(22);
        reader.next(2);    // reserved
        objDescriptor.component_tag = reader.uimsbf(8);

        if (objDescriptor.compatibility_flag === 1) {
            const descriptorLength = (reader.buffer[reader.position >> 3] << 8) | reader.buffer[(reader.position >> 3) + 1];
            objDescriptor.compatibilityDescriptor = new TsDescriptorCompatibility(reader.readBytesRaw(2 + descriptorLength));
        }

        if (objDescriptor.module_info_flag === 1) {
            objDescriptor.num_of_modules = reader.uimsbf(16);
            objDescriptor.modules = [];

            for (let i = 0; i < objDescriptor.num_of_modules; i++) {
                const _module = {} as any as Module;

                _module.module_id = reader.uimsbf(16);
                _module.module_size = reader.uimsbf(32);
                _module.module_info_length = reader.uimsbf(8);
                _module.module_info = new TsCarouselDescriptors(reader.readBytesRaw(_module.module_info_length));

                objDescriptor.modules.push(_module);
            }
        }

        objDescriptor.private_data_length = reader.uimsbf(8);
        objDescriptor.private_data = reader.readBytes(objDescriptor.private_data_length);

        if (objDescriptor.text_info_flag === 1) {
            objDescriptor.ISO_639_language_code = reader.readBytes(3);
            objDescriptor.text_length = reader.uimsbf(8);
            objDescriptor.text = reader.readBytes(objDescriptor.text_length);
        }

        return objDescriptor;
    }
}
