"use strict";

const TsChar = require("./char");
const TsDate = require("./date");

class TsEvent {
    constructor() {
        this.info = {};
        this.descriptors = {};
    }

    setSection(objSection) {
        this.info.originalNetworkId = objSection.original_network_id;
        this.info.transportStreamId = objSection.transport_stream_id;
        this.info.serviceId = objSection.service_id;
    }

    setEvent(_event) {
        this.info.eventId = _event.event_id;
        this.info.startTime = new TsDate(_event.start_time).decode();
        this.info.duration = new TsDate(_event.duration).decodeTimeInSeconds();
        this.info.runningStatus = _event.running_status;
        this.info.freeCaMode = _event.free_CA_mode;

        const tsDescriptors = _event.descriptors.decode();
        const descriptorTags = [];

        for (let i = 0, l = tsDescriptors.length; i < l; i++) {
            const tsDescriptor = tsDescriptors[i];
            const objDescriptor = tsDescriptor.decode();
            const descriptorTag = objDescriptor.descriptor_tag;

            if (!this.descriptors.hasOwnProperty(descriptorTag) || !descriptorTags.includes(descriptorTag)) {
                this.descriptors[descriptorTag] = [];
            }

            this.descriptors[descriptorTag].push(objDescriptor);

            descriptorTags.push(descriptorTag);
        }
    }

    hasShortEvent() {
        return this.descriptors.hasOwnProperty(0x4D);
    }

    hasExtendedEvent() {
        if (!this.descriptors.hasOwnProperty(0x4E)) return false;
        if (this.descriptors[0x4E].length !== this.descriptors[0x4E][0].last_descriptor_number + 1) return false;

        return true;
    }

    hasComponent() {
        return this.descriptors.hasOwnProperty(0x50);
    }

    hasContent() {
        return this.descriptors.hasOwnProperty(0x54);
    }

    hasAudioComponent() {
        return this.descriptors.hasOwnProperty(0xC4);
    }

    hasEventGroup() {
        return this.descriptors.hasOwnProperty(0xD6);
    }

    getInfo() {
        return this.info;
    }

    getShortEvent() {
        if (!this.hasShortEvent()) return null;

        const objDescriptors = this.descriptors[0x4D];

        const shortEvent = {
            languageCode: String.fromCharCode(...objDescriptors[0].ISO_639_language_code),
            eventName: new TsChar(objDescriptors[0].event_name).decode(),
            text: new TsChar(objDescriptors[0].text).decode()
        };

        return shortEvent;
    }

    getExtendedEvent() {
        if (!this.hasExtendedEvent()) return null;

        const objDescriptors = new Array(this.descriptors[0x4E].length);

        for (let i = 0, l = this.descriptors[0x4E].length; i < l; i++) {
            const objDescriptor = this.descriptors[0x4E][i];

            objDescriptors[objDescriptor.descriptor_number] = objDescriptor;
        }

        const extendedEvent = {
            languageCode: String.fromCharCode(...objDescriptors[0].ISO_639_language_code),
            items: {},
            text: new TsChar(objDescriptors[0].text).decode()
        };

        const items = [];

        for (let i = 0, l = objDescriptors.length; i < l; i++) {
            const objDescriptor = objDescriptors[i];

            for (let j = 0, l2 = objDescriptor.items.length; j < l2; j++) {
                const item = objDescriptor.items[j];

                if (item.item_description_length !== 0) {
                    items.push({
                        itemDescription: item.item_description,
                        item: []
                    });
                }

                items[items.length - 1].item.push(item.item);
            }
        }

        for (let i = 0, l = items.length; i < l; i++) {
            const itemDescription = new TsChar(items[i].itemDescription).decode();
            const item = new TsChar(Buffer.concat(items[i].item)).decode();

            extendedEvent.items[itemDescription] = item;
        }

        return extendedEvent;
    }

    getComponent() {
        if (!this.hasComponent()) return null;

        const objDescriptors = this.descriptors[0x50];

        const component = {
            streamContent: objDescriptors[0].stream_content,
            componentType: objDescriptors[0].component_type,
            componentTag: objDescriptors[0].component_tag,
            languageCode: String.fromCharCode(...objDescriptors[0].ISO_639_language_code),
            text: new TsChar(objDescriptors[0].text).decode()
        };

        return component;
    }

    getContent() {
        if (!this.hasContent()) return null;

        const objDescriptors = this.descriptors[0x54];

        const content = {
            contents: []
        };

        for (let i = 0, l = objDescriptors[0].contents.length; i < l; i++) {
            const _content = objDescriptors[0].contents[i];

            content.contents.push({
                contentNibbleLevel1: _content.content_nibble_level_1,
                contentNibbleLevel2: _content.content_nibble_level_2,
                userNibble1: _content.user_nibble_1,
                userNibble2: _content.user_nibble_2
            });
        }

        return content;
    }

    getAudioComponent() {
        if (!this.hasAudioComponent()) return null;

        const objDescriptors = this.descriptors[0xC4];

        const audioComponent = {
            streamContent: objDescriptors[0].stream_content,
            componentType: objDescriptors[0].component_type,
            componentTag: objDescriptors[0].component_tag,
            streamType: objDescriptors[0].stream_type,
            simulcastGroupTag: objDescriptors[0].simulcast_group_tag,
            esMultiLingualFlag: objDescriptors[0].ES_multi_lingual_flag,
            mainComponentFlag: objDescriptors[0].main_component_flag,
            qualityIndicator: objDescriptors[0].quality_indicator,
            samplingRate: objDescriptors[0].sampling_rate,
            languageCode: String.fromCharCode(...objDescriptors[0].ISO_639_language_code),
            languageCode2: objDescriptors[0].ES_multi_lingual_flag === 1 ? String.fromCharCode(...objDescriptors[0].ISO_639_language_code_2) : "",
            text: new TsChar(objDescriptors[0].text).decode(),
            dialogControl: objDescriptors[0].component_type >> 7,
            audioForHandicapped: (objDescriptors[0].component_type & 0x60) >> 5,
            audioMode: objDescriptors[0].component_type & 0x1F
        };

        return audioComponent;
    }

    getEventGroup() {
        if (!this.hasEventGroup()) return null;

        const objDescriptors = this.descriptors[0xD6];

        const eventGroup = {
            groupTypes: {}
        };

        for (let i = 0, l = objDescriptors.length; i < l; i++) {
            const objDescriptor = objDescriptors[i];

            if (!eventGroup.groupTypes.hasOwnProperty(objDescriptor.group_type)) {
                eventGroup.groupTypes[objDescriptor.group_type] = {
                    events: [],
                    otherNetworkEvents: []
                };
            }
            const groupType = eventGroup.groupTypes[objDescriptor.group_type];

            for (let j = 0, l2 = objDescriptor.events.length; j < l2; j++) {
                const _event = objDescriptor.events[i];

                groupType.events.push({
                    serviceId: _event.service_id,
                    eventId: _event.event_id
                });
            }

            if (objDescriptor.group_type === 4 || objDescriptor.group_type === 5) {
                for (let j = 0, l2 = objDescriptor.events.length; j < l2; j++) {
                    const _event = objDescriptor.events[i];

                    groupType.otherNetworkEvents.push({
                        originalNetworkId: _event.original_network_id,
                        transportStreamId: _event.transport_stream_id,
                        serviceId: _event.service_id,
                        eventId: _event.event_id
                    });
                }
            }
        }

        return eventGroup;
    }
}

module.exports = TsEvent;
