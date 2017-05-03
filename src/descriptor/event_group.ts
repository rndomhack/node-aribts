import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface EventGroup extends Descriptor {
    group_type: number;
    event_count: number;
    events: Event[];
    other_network_events?: OtherNetworkEvent[];
    private_data?: Buffer;
}

export interface Event {
    service_id: number;
    event_id: number;
}

export interface OtherNetworkEvent extends Event {
    original_network_id: number;
    transport_stream_id: number;
}

export default class TsDescriptorEventGroup extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): EventGroup {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as EventGroup;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.group_type = reader.uimsbf(4);
        objDescriptor.event_count = reader.uimsbf(4);
        objDescriptor.events = [];

        for (let i = 0; i < objDescriptor.event_count; i++) {
            const _event = {} as any as Event;

            _event.service_id = reader.uimsbf(16);
            _event.event_id = reader.uimsbf(16);

            objDescriptor.events.push(_event);
        }

        if (objDescriptor.group_type === 4 || objDescriptor.group_type === 5) {
            objDescriptor.other_network_events = [];

            for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
                const _event = {} as any as OtherNetworkEvent;

                _event.original_network_id = reader.uimsbf(16);
                _event.transport_stream_id = reader.uimsbf(16);
                _event.service_id = reader.uimsbf(16);
                _event.event_id = reader.uimsbf(16);

                objDescriptor.other_network_events.push(_event);
            }
        } else {
            objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));
        }

        return objDescriptor;
    }
}
