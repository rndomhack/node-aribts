"use strict";

const TsReader = require("../reader");
const TsDescriptorCompatibility = require("./compatibility");

class TsDescriptorNetworkDownloadContent {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

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
            objDescriptor.ipv4_address = reader.bytesRead(4);
            objDescriptor.port_number = reader.uimsbf(16);
        }

        if (objDescriptor.address_type === 0x01) {
            objDescriptor.ipv6_address = reader.bytesRead(16);
            objDescriptor.port_number = reader.uimsbf(16);
        }

        if (objDescriptor.address_type === 0x02) {
            objDescriptor.URL_length = reader.uimsbf(8);
            objDescriptor.URL_byte = reader.bytesRead(objDescriptor.URL_length);
        }

        if (objDescriptor.compatibility_flag === 1) {
            let descriptorLength = (reader.buffer[reader.position >> 3] << 8) | reader.buffer[(reader.position >> 3) + 1];
            objDescriptor.compatibilityDescriptor = new TsDescriptorCompatibility(reader.readBytesRaw(2 + descriptorLength)).decode();
        }

        objDescriptor.private_data_length = reader.uimsbf(8);
        objDescriptor.private_data_byte = reader.readBytes(objDescriptor.private_data_length);

        if (objDescriptor.text_info_flag === 1) {
            objDescriptor.ISO_639_language_code = reader.uimsbf(24);
            objDescriptor.text_length = reader.uimsbf(8);
            objDescriptor.text_char = reader.readBytes(objDescriptor.text_length);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorNetworkDownloadContent;
