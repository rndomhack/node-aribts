import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";
import TsDescriptorCompatibility from "./compatibility";

export interface NetworkDownloadContent extends Descriptor {
    reboot: number;
    add_on: number;
    compatibility_flag: number;
    text_info_flag: number;
    component_size: number;
    session_protcol_number: number;
    session_id: number;
    retry: number;
    connect_timer: number;
    address_type: number;
    ipv4_address?: Buffer;
    ipv6_address?: Buffer;
    port_number?: number;
    URL_length?: number;
    URL?: Buffer;
    compatibilityDescriptor?: TsDescriptorCompatibility;
    private_data_length: number;
    private_data: Buffer;
    ISO_639_language_code?: Buffer;
    text_length?: number;
    text?: Buffer;
}

export default class TsDescriptorNetworkDownloadContent extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): NetworkDownloadContent {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as NetworkDownloadContent;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reboot = reader.bslbf(1);
        objDescriptor.add_on = reader.bslbf(1);
        objDescriptor.compatibility_flag = reader.bslbf(1);
        objDescriptor.text_info_flag = reader.bslbf(1);
        reader.next(4);    // reserved
        objDescriptor.component_size = reader.uimsbf(32);
        objDescriptor.session_protcol_number = reader.uimsbf(8);
        objDescriptor.session_id = reader.uimsbf(32);
        objDescriptor.retry = reader.uimsbf(8);
        objDescriptor.connect_timer = reader.uimsbf(24);
        objDescriptor.address_type = reader.uimsbf(8);

        if (objDescriptor.address_type === 0x00) {
            objDescriptor.ipv4_address = reader.readBytes(4);
            objDescriptor.port_number = reader.uimsbf(16);
        }

        if (objDescriptor.address_type === 0x01) {
            objDescriptor.ipv6_address = reader.readBytes(16);
            objDescriptor.port_number = reader.uimsbf(16);
        }

        if (objDescriptor.address_type === 0x02) {
            objDescriptor.URL_length = reader.uimsbf(8);
            objDescriptor.URL = reader.readBytes(objDescriptor.URL_length);
        }

        if (objDescriptor.compatibility_flag === 1) {
            const descriptorLength = (reader.buffer[reader.position >> 3] << 8) | reader.buffer[(reader.position >> 3) + 1];
            objDescriptor.compatibilityDescriptor = new TsDescriptorCompatibility(reader.readBytesRaw(2 + descriptorLength));
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
