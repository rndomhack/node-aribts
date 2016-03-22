"use strict";

const TsReader = require("../reader");

class TsDescriptorEventGroup {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.group_type = reader.uimsbf(4);
        objDescriptor.event_count = reader.uimsbf(4);
        objDescriptor.events = [];

        for (let i = 0; i < objDescriptor.event_count; i++) {
            let _event = {};

            _event.service_id = reader.uimsbf(16);
            _event.event_id = reader.uimsbf(16);

            objDescriptor.events.push(_event);
        }

        if (objDescriptor.group_type === 4 || objDescriptor.group_type === 5) {
            objDescriptor.other_network_events = [];

            while (reader.position >> 3 < 2 + objDescriptor.descriptor_length) {
                let _event = {};

                _event.original_network_id = reader.uimsbf(16);
                _event.transport_stream_id = reader.uimsbf(16);
                _event.service_id = reader.uimsbf(16);
                _event.event_id = reader.uimsbf(16);

                objDescriptor.other_network_events.push(_event);
            }
        } else {
            objDescriptor.private_data_byte = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorEventGroup;
