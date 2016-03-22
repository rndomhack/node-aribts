"use strict";

const TsChar = require("./char");
const TsDate = require("./date");
const epgTable = require("./epg_table");

class TsEpg {
    constructor() {
        this.epg = {};
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

        return false;
    }

    addEit(pid, objEit) {
        if (pid !== 0x12) return true;
        if (objEit.events.length === 0) return true;

        let onid = objEit.original_network_id;
        let tsid = objEit.transport_stream_id;
        let sid = objEit.service_id;

        if (!this.epg.hasOwnProperty(onid)) {
            this.epg[onid] = {};
        }

        if (!this.epg[onid].hasOwnProperty(tsid)) {
            this.epg[onid][tsid] = {};
        }

        if (!this.epg[onid][tsid].hasOwnProperty(sid)) {
            this.epg[onid][tsid][sid] = {
                pf: {},
                schedule: {},
                field: {
                    current: new Buffer(32).fill(0),
                    end: new Buffer(32).fill(0)
                }
            };
        }

        let objService = this.epg[onid][tsid][sid];

        objEit.events.forEach(event => {
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
                }
            };

            event.descriptors.forEach(descriptor => {
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
                }
            });

            Object.keys(descriptors).forEach(key => {
                let descriptor = descriptors[key];

                if (descriptor.needUpdate === false) return;
                if (descriptor.descriptor === null) return;

                objEvent[key] = descriptor.descriptor;
            });
        });

        if (objEit.table_id !== 0x4E && objEit.table_id !== 0x4F) {
            let segment = objEit.table_id - 0x50;
            let section = objEit.section_number >> 3;
            let last_section = objEit.last_section_number >> 3;

            if (objService.field.end[segment] === 0) {
                for (let i = 0; i <= last_section; i++) {
                    objService.field.end[segment] |= 1 << i;
                }
            }

            objService.field.current[segment] |= 1 << section;
        }

        return true;
    }

    isPresent(onid, tsid, sid) {
        if (!this.epg.hasOwnProperty(onid)) return false;
        if (!this.epg[onid].hasOwnProperty(tsid)) return false;
        if (!this.epg[onid][tsid].hasOwnProperty(sid)) return false;

        let objService = this.epg[onid][tsid][sid];

        return objService.pf.hasOwnProperty("present");
    }

    isFollowing(onid, tsid, sid) {
        if (!this.epg.hasOwnProperty(onid)) return false;
        if (!this.epg[onid].hasOwnProperty(tsid)) return false;
        if (!this.epg[onid][tsid].hasOwnProperty(sid)) return false;

        let objService = this.epg[onid][tsid][sid];

        return objService.pf.hasOwnProperty("following");
    }

    isSchedule() {
        return Object.keys(this.epg).every(onid => {
            return Object.keys(this.epg[onid]).every(tsid => {
                return Object.keys(this.epg[onid][tsid]).every(sid => {
                    let objService = this.epg[onid][tsid][sid];

                    if (objService.field.end.every(data => data === 0x00)) {
                        return false;
                    }

                    return objService.field.current.equals(objService.field.end);
                });
            });
        });
    }

    getPresent(onid, tsid, sid) {
        if (!this.epg.hasOwnProperty(onid)) return {};
        if (!this.epg[onid].hasOwnProperty(tsid)) return {};
        if (!this.epg[onid][tsid].hasOwnProperty(sid)) return {};

        let objService = this.epg[onid][tsid][sid];

        return objService.pf.present;
    }

    getFollowing(onid, tsid, sid) {
        if (!this.epg.hasOwnProperty(onid)) return {};
        if (!this.epg[onid].hasOwnProperty(tsid)) return {};
        if (!this.epg[onid][tsid].hasOwnProperty(sid)) return {};

        let objService = this.epg[onid][tsid][sid];

        return objService.pf.following;
    }

    getSchedule() {
        let objSchedule = {};

        Object.keys(this.epg).forEach(onid => {
            objSchedule[onid] = {};

            return Object.keys(this.epg[onid]).forEach(tsid => {
                objSchedule[onid][tsid] = {};

                return Object.keys(this.epg[onid][tsid]).forEach(sid => {
                    let objService = this.epg[onid][tsid][sid];

                    objSchedule[onid][tsid][sid] = objService.schedule;
                });
            });
        });

        return objSchedule;
    }
}

module.exports = TsEpg;
