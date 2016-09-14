"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorDigitalCopyControl extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this.buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.digital_recording_control_data = reader.bslbf(2);
        objDescriptor.maximum_bitrate_flag = reader.bslbf(1);
        objDescriptor.component_control_flag = reader.bslbf(1);
        objDescriptor.user_defined = reader.bslbf(4);

        if (objDescriptor.maximum_bitrate_flag === 1) {
            objDescriptor.maximum_bitrate = reader.uimsbf(8);
        }

        if (objDescriptor.component_control_flag === 1) {
            objDescriptor.component_control_length = reader.uimsbf(8);
            objDescriptor.component_controls = [];

            for (let i = 0; i < objDescriptor.component_control_length; i += 2) {
                const component_control = {};

                component_control.component_tag = reader.uimsbf(8);
                component_control.digital_recording_control_data = reader.bslbf(2);
                component_control.maximum_bitrate_flag = reader.bslbf(1);
                reader.next(1);    // reserved_future_use
                component_control.user_defined = reader.bslbf(4);

                if (component_control.maximum_bitrate_flag === 1) {
                    component_control.maximum_bitrate = reader.uimsbf(8);
                    i += 1;
                }

                objDescriptor.component_controls.push(component_control);
            }
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorDigitalCopyControl;
