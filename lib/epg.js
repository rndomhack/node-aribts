"use strict";

const TsChar = require("./char");
const TsDate = require("./date");
const epgTable = require("./epg_table");

class TsEpg {
    constructor() {
        this.epg = new Map();
    }

    needUpdate(current, next) {
        if (current === null) return true;

        if (current.table_id === 0x4E || current.table_id === 0x4F) {
            if (next.table_id !== 0x4E && next.table_id !== 0x4F) {
                return false;
            }
        }

        if (current.version_number === next.version_number) {
            return false;
        }

        return true;
    }

    addEit(pid, objEit, time) {
        if (pid !== 0x12) return false;
        if (objEit.current_next_indicator === 0) return false;

        let onid = objEit.original_network_id;
        let tsid = objEit.transport_stream_id;
        let sid = objEit.service_id;
        let mapOriginalNetwork = this.epg;
        let mapTransportStream = null;
        let mapService = null;
        let objService = null;

        if (mapOriginalNetwork.has(onid)) {
            mapTransportStream = mapOriginalNetwork.get(onid);
        } else {
            mapTransportStream = new Map();
            mapOriginalNetwork.set(onid, mapTransportStream);
        }

        if (mapTransportStream.has(tsid)) {
            mapService = mapTransportStream.get(tsid);
        } else {
            mapService = new Map();
            mapTransportStream.set(tsid, mapService);
        }

        if (mapService.has(sid)) {
            objService = mapService.get(sid);
        } else {
            objService = {
                pf: {
                    present: null,
                    following: null
                },
                schedule: {},
                basic_flags: {
                    flags: [],
                    last_flags_id: -1
                },
                extended_flags: {
                    flags: [],
                    last_flags_id: -1
                }
            };

            for (let target_flags of [objService.basic_flags, objService.extended_flags]) {
                for (let i = 0; i < 0x08; i++) {
                    target_flags.flags.push({
                        flag: Buffer.alloc(0x20, 0x00),
                        ignore: Buffer.alloc(0x20, 0xFF),
                        version_number: -1
                    });
                }
            }

            mapService.set(sid, objService);
        }

        for (let event of objEit.events) {
            let objEvent;

            // Check existing event
            if (objService.schedule.hasOwnProperty(event.event_id)) {
                objEvent = objService.schedule[event.event_id];

                if (this.needUpdate(objEvent, event)) {
                    let startTime = new TsDate(event.start_time).decode();
                    let duration = new TsDate(event.duration).decodeTime();

                    objEvent.table_id = objEit.table_id;
                    objEvent.version_number = objEit.version_number;

                    objEvent.event_id = event.event_id;
                    objEvent.start_time = startTime;
                    objEvent.duration = duration[0] * 3600 + duration[1] * 60 + duration[2];
                    objEvent.running_status = event.running_status;
                    objEvent.free_CA_mode = event.free_CA_mode;
                }
            } else {
                objEvent = {};

                let startTime = new TsDate(event.start_time).decode();
                let duration = new TsDate(event.duration).decodeTime();

                objEvent.table_id = objEit.table_id;
                objEvent.version_number = objEit.version_number;

                objEvent.event_id = event.event_id;
                objEvent.start_time = startTime;
                objEvent.duration = duration[0] * 3600 + duration[1] * 60 + duration[2];
                objEvent.running_status = event.running_status;
                objEvent.free_CA_mode = event.free_CA_mode;

                objEvent.short_event = null;
                objEvent.extended_event = null;
                objEvent.component = null;
                objEvent.content = null;
                objEvent.audio_component = null;
                objEvent.event_group = null;

                objService.schedule[event.event_id] = objEvent;
            }

            // Check present and following
            if (objEit.table_id === 0x4E || objEit.table_id === 0x4F) {
                if (objEit.section_number === 0) {
                    objService.pf.present = objEvent;
                } else if (objEit.section_number === 1) {
                    objService.pf.following = objEvent;
                }
            }

            let descriptors = {
                short_event: {
                    descriptor: null,
                    needUpdate: this.needUpdate(objEvent.short_event, objEvent),
                    item_description: null
                },
                extended_event: {
                    descriptor: null,
                    needUpdate: this.needUpdate(objEvent.extended_event, objEvent)
                },
                component: {
                    descriptor: null,
                    needUpdate: this.needUpdate(objEvent.component, objEvent)
                },
                content: {
                    descriptor: null,
                    needUpdate: this.needUpdate(objEvent.content, objEvent)
                },
                audio_component: {
                    descriptor: null,
                    needUpdate: this.needUpdate(objEvent.audio_component, objEvent)
                },
                event_group: {
                    descriptor: null,
                    needUpdate: this.needUpdate(objEvent.event_group, objEvent)
                }
            };

            for (let descriptor of event.descriptors) {
                switch (descriptor.descriptor_tag) {
                    case 0x4D:
                        // Short event
                        let short_event = descriptors.short_event;

                        if (!short_event.needUpdate) break;

                        if (short_event.descriptor === null) {
                            short_event.descriptor = {};
                        }

                        short_event.descriptor.table_id = objEit.table_id;
                        short_event.descriptor.version_number = objEit.version_number;

                        short_event.descriptor.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        short_event.descriptor.event_name = new TsChar(descriptor.event_name_char).decode();
                        short_event.descriptor.text = new TsChar(descriptor.text_char).decode();

                        break;

                    case 0x4E:
                        // Extended event
                        let extended_event = descriptors.extended_event;

                        if (!extended_event.needUpdate) break;

                        if (extended_event.descriptor === null) {
                            extended_event.descriptor = {};
                        }

                        extended_event.descriptor.table_id = objEit.table_id;
                        extended_event.descriptor.version_number = objEit.version_number;

                        extended_event.descriptor.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        extended_event.descriptor.items = extended_event.descriptor.items || [];
                        extended_event.descriptor.text = new TsChar(descriptor.text_char).decode();

                        descriptor.items.forEach(item => {
                            if (item.item_description_length !== 0) {
                                if (typeof extended_event.descriptor.items === "string") {
                                    extended_event.descriptor.items = [extended_event.descriptor.items];
                                }

                                if (extended_event.descriptor.items.length !== 0) {
                                    extended_event.descriptor.items.push("\r\n\r\n");
                                }

                                extended_event.descriptor.items.push([item.item_description_char]);
                                extended_event.descriptor.items.push("\r\n");
                                extended_event.descriptor.items.push([]);
                            }

                            extended_event.descriptor.items[extended_event.descriptor.items.length - 1].push(item.item_char);

                            if (descriptor.descriptor_number === descriptor.last_descriptor_number) {
                                extended_event.descriptor.items = extended_event.descriptor.items.map(_item => {
                                    if (!Array.isArray(_item)) return _item;

                                    return new TsChar(Buffer.concat(_item)).decode();
                                }).join("");
                            }
                        });

                        break;

                    case 0x50:
                        // Component
                        let component = descriptors.component;

                        if (!component.needUpdate) break;

                        if (component.descriptor === null) {
                            component.descriptor = {};
                        }

                        component.descriptor.table_id = objEit.table_id;
                        component.descriptor.version_number = objEit.version_number;

                        component.descriptor.stream_content = descriptor.stream_content;
                        component.descriptor.component_type = descriptor.component_type;
                        component.descriptor.component_tag = descriptor.component_tag;
                        component.descriptor.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        component.descriptor.text = new TsChar(descriptor.text_char).decode();

                        component.descriptor.component_text = epgTable.component.hasOwnProperty(descriptor.stream_content) &&
                                                              epgTable.component[descriptor.stream_content].hasOwnProperty(descriptor.component_type) ?
                                                              epgTable.component[descriptor.stream_content][descriptor.component_type] : "";

                        break;

                    case 0x54:
                        // Content
                        let content = descriptors.content;

                        if (!content.needUpdate) break;

                        if (content.descriptor === null) {
                            content.descriptor = {};
                        }

                        content.descriptor.table_id = objEit.table_id;
                        content.descriptor.version_number = objEit.version_number;

                        content.descriptor.contents = descriptor.contents.map(_content => {
                            return {
                                content_nibble_level_1: _content.content_nibble_level_1,
                                content_nibble_level_2: _content.content_nibble_level_2,
                                user_nibble_1: _content.user_nibble_1,
                                user_nibble_2: _content.user_nibble_2,
                                content_nibble_level_1_text: epgTable.nibble.level_1[_content.content_nibble_level_1],
                                content_nibble_level_2_text: epgTable.nibble.level_2[_content.content_nibble_level_1][_content.content_nibble_level_2]
                            };
                        });

                        break;

                    case 0xC4:
                        // Audio component
                        let audio_component = descriptors.audio_component;

                        if (!audio_component.needUpdate) break;

                        if (audio_component.descriptor === null) {
                            audio_component.descriptor = {};
                        }

                        audio_component.descriptor.table_id = objEit.table_id;
                        audio_component.descriptor.version_number = objEit.version_number;

                        audio_component.descriptor.stream_content = descriptor.stream_content;
                        audio_component.descriptor.component_type = descriptor.component_type;
                        audio_component.descriptor.component_tag = descriptor.component_tag;
                        audio_component.descriptor.stream_type = descriptor.stream_type;
                        audio_component.descriptor.simulcast_group_tag = descriptor.simulcast_group_tag;
                        audio_component.descriptor.ES_multi_lingual_flag = descriptor.ES_multi_lingual_flag;
                        audio_component.descriptor.main_component_flag = descriptor.main_component_flag;
                        audio_component.descriptor.quality_indicator = descriptor.quality_indicator;
                        audio_component.descriptor.sampling_rate = descriptor.sampling_rate;
                        audio_component.descriptor.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);

                        if (audio_component.descriptor.ES_multi_lingual_flag === 1) {
                            audio_component.descriptor.ISO_639_language_code_2 = String.fromCharCode(...descriptor.ISO_639_language_code_2);
                        }

                        audio_component.descriptor.text_char = new TsChar(descriptor.text_char).decode();

                        audio_component.descriptor.dialog_control_text = epgTable.dialog_control[descriptor.component_type >> 7];
                        audio_component.descriptor.audio_for_handicapped_text = epgTable.audio_for_handicapped[(descriptor.component_type >> 5) & 0x03];
                        audio_component.descriptor.audio_mode_text = epgTable.audio_mode[descriptor.component_type & 0x1F];
                        audio_component.descriptor.quality_indicator_text = epgTable.quality_indicator[descriptor.quality_indicator];
                        audio_component.descriptor.sampling_rate_text = epgTable.sampling_rate[descriptor.sampling_rate];

                        break;

                    case 0xD6:
                        // Event group
                        let event_group = descriptors.event_group;

                        if (!event_group.needUpdate) break;

                        if (event_group.descriptor === null) {
                            event_group.descriptor = {};
                        }

                        event_group.descriptor.table_id = objEit.table_id;
                        event_group.descriptor.version_number = objEit.version_number;

                        event_group.descriptor.group_type = descriptor.group_type;
                        event_group.descriptor.event_count = descriptor.event_count;

                        event_group.descriptor.events = descriptor.events.map(_event => {
                            return {
                                service_id: _event.service_id,
                                event_id: _event.event_id
                            };
                        });

                        if (descriptor.group_type === 4 || descriptor.group_type === 5) {
                            event_group.descriptor.other_network_events = descriptor.other_network_events.map(_event => {
                                return {
                                    original_network_id: _event.original_network_id,
                                    transport_stream_id: _event.transport_stream_id,
                                    service_id: _event.service_id,
                                    event_id: _event.event_id
                                };
                            });
                        }

                        break;
                }
            }

            for (let key of Object.keys(descriptors)) {
                let descriptor = descriptors[key];

                if (descriptor.needUpdate === false) continue;
                if (descriptor.descriptor === null) continue;

                objEvent[key] = descriptor.descriptor;
            }
        }

        if (objEit.table_id !== 0x4E && objEit.table_id !== 0x4F) {
            let flags_id = objEit.table_id & 0x07;
            let last_flags_id = objEit.last_table_id & 0x07;
            let segment_number = objEit.section_number >> 3;
            let last_segment_number = objEit.last_section_number >> 3;
            let section_number = objEit.section_number & 0x07;
            let segment_last_section_number = objEit.segment_last_section_number & 0x07;
            let target_flags = (objEit.table_id & 0x0F) < 0x08 ? objService.basic_flags : objService.extended_flags;

            if ((target_flags.last_flags_id !== last_flags_id) ||
                (target_flags.flags[flags_id].version_number !== -1 && target_flags.flags[flags_id].version_number !== objEit.version_number)) {
                // Reset fields
                for (let i = 0; i < 0x08; i++) {
                    target_flags.flags[i].flag.fill(0x00);
                    target_flags.flags[i].ignore.fill(i <= last_flags_id ? 0x00 : 0xFF);
                }
            }

            // Update ignore field (past segment)
            if (flags_id === 0 && time !== null) {
                let segment = (time.getTime() - time.getTimezoneOffset() * 60 * 1000) / (3 * 60 * 60 * 1000) & 0x07;

                for (let i = 0; i < segment; i++) {
                    target_flags.flags[flags_id].ignore[i] = 0xFF;
                }
            }

            // Update ignore field (segment)
            for (let i = last_segment_number + 1; i < 0x20 ; i++) {
                target_flags.flags[flags_id].ignore[i] = 0xFF;
            }

            // Update ignore field (section)
            for (let i = segment_last_section_number + 1; i < 8; i++) {
                target_flags.flags[flags_id].ignore[segment_number] |= 1 << i;
            }

            // Update flag field
            target_flags.flags[flags_id].flag[segment_number] |= 1 << section_number;

            // Update last_table_id & version_number
            target_flags.last_flags_id = last_flags_id;
            target_flags.flags[flags_id].version_number = objEit.version_number;
        }

        return true;
    }

    hasPresent(onid, tsid, sid) {
        let mapOriginalNetwork = this.epg;

        if (!mapOriginalNetwork.has(onid)) return false;
        let mapTransportStream = mapOriginalNetwork.get(onid);

        if (!mapTransportStream.has(tsid)) return false;
        let mapService = mapTransportStream.get(tsid);

        if (!mapService.has(sid)) return false;
        let objService = mapService.get(sid);

        return objService.pf.present !== null;
    }

    hasFollowing(onid, tsid, sid) {
        let mapOriginalNetwork = this.epg;

        if (!mapOriginalNetwork.has(onid)) return false;
        let mapTransportStream = mapOriginalNetwork.get(onid);

        if (!mapTransportStream.has(tsid)) return false;
        let mapService = mapTransportStream.get(tsid);

        if (!mapService.has(sid)) return false;
        let objService = mapService.get(sid);

        return objService.pf.following !== null;
    }

    hasSchedule() {
        let mapOriginalNetwork = this.epg;

        for (let mapTransportStream of mapOriginalNetwork.values()) {
            for (let mapService of mapTransportStream.values()) {
                for (let objService of mapService.values()) {
                    for (let target_flags of [objService.basic_flags, objService.extended_flags]) {
                        for (let table of target_flags.flags) {
                            for (let i = 0; i < 0x20; i++) {
                                if ((table.flag[i] | table.ignore[i]) !== 0xFF) {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }

        return true;
    }

    getPresent(onid, tsid, sid) {
        let mapOriginalNetwork = this.epg;

        if (!mapOriginalNetwork.has(onid)) return {};
        let mapTransportStream = mapOriginalNetwork.get(onid);

        if (!mapTransportStream.has(tsid)) return {};
        let mapService = mapTransportStream.get(tsid);

        if (!mapService.has(sid)) return {};
        let objService = mapService.get(sid);

        return objService.pf.present;
    }

    getFollowing(onid, tsid, sid) {
        let mapOriginalNetwork = this.epg;

        if (!mapOriginalNetwork.has(onid)) return {};
        let mapTransportStream = mapOriginalNetwork.get(onid);

        if (!mapTransportStream.has(tsid)) return {};
        let mapService = mapTransportStream.get(tsid);

        if (!mapService.has(sid)) return {};
        let objService = mapService.get(sid);

        return objService.pf.following;
    }

    getSchedule() {
        let objSchedule = {};
        let mapOriginalNetwork = this.epg;

        for (let originalNetwork of mapOriginalNetwork) {
            let onid = originalNetwork[0];
            let mapTransportStream = originalNetwork[1];

            objSchedule[onid] = {};

            for (let transportStream of mapTransportStream) {
                let tsid = transportStream[0];
                let mapService = transportStream[1];

                objSchedule[onid][tsid] = {};

                for (let service of mapService) {
                    let sid = service[0];
                    let objService = service[1];

                    objSchedule[onid][tsid][sid] = objService.schedule;
                }
            }
        }

        return objSchedule;
    }

    getScheduleAmount() {
        let overall = 0;
        let stored = 0;
        let mapOriginalNetwork = this.epg;

        for (let mapTransportStream of mapOriginalNetwork.values()) {
            for (let mapService of mapTransportStream.values()) {
                for (let objService of mapService.values()) {
                    for (let target_flags of [objService.basic_flags, objService.extended_flags]) {
                        for (let table of target_flags.flags) {
                            for (let i = 0; i < 0x20; i++) {
                                for (let j = 0; j < 8; j++) {
                                    stored += table.flag[i] >> j & 0x01;
                                    overall += (table.ignore[i] ^ 0xFF) >> j & 0x01;
                                }
                            }
                        }
                    }
                }
            }
        }

        return [overall, stored];
    }
}

module.exports = TsEpg;
