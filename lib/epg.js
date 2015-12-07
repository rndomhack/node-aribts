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

        var onid = objEit.original_network_id;
        var tsid = objEit.transport_stream_id;
        var sid = objEit.service_id;

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

        var objService = this.epg[onid][tsid][sid];

        objEit.events.forEach(event => {
            var objEvent;
            var item_description = null;

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

            let needUpdate = {
                short_event: this.needUpdate(objEvent.short_event, objEvent),
                extended_event: this.needUpdate(objEvent.extended_event, objEvent),
                component: this.needUpdate(objEvent.component, objEvent),
                content: this.needUpdate(objEvent.content, objEvent),
                audio_component: this.needUpdate(objEvent.audio_component, objEvent)
            };

            event.descriptors.forEach(descriptor => {
                switch (descriptor.descriptor_tag) {
                    case 0x4D:
                        // Short event
                        if (!needUpdate.short_event) break;

                        if (objEvent.short_event === null) {
                            objEvent.short_event = {};
                        }

                        objEvent.short_event.table_id = objEit.table_id;
                        objEvent.short_event.version_number = objEit.version_number;

                        objEvent.short_event.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        objEvent.short_event.event_name = new TsChar(descriptor.event_name_char).decode();
                        objEvent.short_event.text = new TsChar(descriptor.text_char).decode();

                        break;

                    case 0x4E:
                        // Extended event
                        if (!needUpdate.extended_event) break;

                        if (objEvent.extended_event === null) {
                            objEvent.extended_event = {};
                        }

                        objEvent.extended_event.table_id = objEit.table_id;
                        objEvent.extended_event.version_number = objEit.version_number;

                        objEvent.extended_event.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        objEvent.extended_event.items = objEvent.extended_event.items || {};
                        objEvent.extended_event.text = new TsChar(descriptor.text_char).decode();

                        descriptor.items.forEach(item => {
                            if (item.item_description_length && item_description !== null) {
                                objEvent.extended_event.items[item_description] = new TsChar(Buffer.concat(objEvent.extended_event.items[item_description])).decode();
                            }

                            if (item.item_description_length) {
                                item_description = new TsChar(item.item_description_char).decode();

                                objEvent.extended_event.items[item_description] = [];
                            }

                            objEvent.extended_event.items[item_description].push(item.item_char);

                            if (descriptor.descriptor_number === descriptor.last_descriptor_number) {
                                objEvent.extended_event.items[item_description] = new TsChar(Buffer.concat(objEvent.extended_event.items[item_description])).decode();
                            }
                        });

                        break;

                    case 0x50:
                        // Component
                        if (!needUpdate.component) break;

                        if (objEvent.component === null) {
                            objEvent.component = {};
                        }

                        objEvent.component.table_id = objEit.table_id;
                        objEvent.component.version_number = objEit.version_number;

                        objEvent.component.stream_content = descriptor.stream_content;
                        objEvent.component.component_type = descriptor.component_type;
                        objEvent.component.component_tag = descriptor.component_tag;
                        objEvent.component.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        objEvent.component.text = new TsChar(descriptor.text_char).decode();

                        objEvent.component.component_text = epgTable.component.hasOwnProperty(descriptor.stream_content) &&
                                                            epgTable.component[descriptor.stream_content].hasOwnProperty(descriptor.component_type) ?
                                                            epgTable.component[descriptor.stream_content][descriptor.component_type] : "";

                        break;

                    case 0x54:
                        // Content
                        if (!needUpdate.content) break;

                        if (objEvent.content === null) {
                            objEvent.content = {};
                        }

                        objEvent.content.table_id = objEit.table_id;
                        objEvent.content.version_number = objEit.version_number;

                        objEvent.content.contents = descriptor.contents.map(content => {
                            return {
                                content_nibble_level_1: content.content_nibble_level_1,
                                content_nibble_level_2: content.content_nibble_level_2,
                                user_nibble_1: content.user_nibble_1,
                                user_nibble_2: content.user_nibble_2,
                                content_nibble_level_1_text: epgTable.nibble.level_1[content.content_nibble_level_1],
                                content_nibble_level_2_text: epgTable.nibble.level_2[content.content_nibble_level_1][content.content_nibble_level_2]
                            };
                        });

                        break;

                    case 0xC4:
                        // Audio component
                        if (!needUpdate.audio_component) break;

                        if (objEvent.audio_component === null) {
                            objEvent.audio_component = {};
                        }

                        objEvent.audio_component.table_id = objEit.table_id;
                        objEvent.audio_component.version_number = objEit.version_number;

                        objEvent.audio_component.stream_content = descriptor.stream_content;
                        objEvent.audio_component.component_type = descriptor.component_type;
                        objEvent.audio_component.component_tag = descriptor.component_tag;
                        objEvent.audio_component.stream_type = descriptor.stream_type;
                        objEvent.audio_component.simulcast_group_tag = descriptor.simulcast_group_tag;
                        objEvent.audio_component.ES_multi_lingual_flag = descriptor.ES_multi_lingual_flag;
                        objEvent.audio_component.main_component_flag = descriptor.main_component_flag;
                        objEvent.audio_component.quality_indicator = descriptor.quality_indicator;
                        objEvent.audio_component.sampling_rate = descriptor.sampling_rate;
                        objEvent.audio_component.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);

                        if (objEvent.audio_component.ES_multi_lingual_flag === 1) {
                            objEvent.audio_component.ISO_639_language_code_2 = String.fromCharCode(...descriptor.ISO_639_language_code_2);
                        }

                        objEvent.audio_component.text_char = new TsChar(descriptor.text_char).decode();

                        objEvent.audio_component.audio_mode_text = epgTable.audio_mode[descriptor.component_type & 0x1F];
                        objEvent.audio_component.quality_indicator_text = epgTable.quality_indicator[descriptor.quality_indicator];
                        objEvent.audio_component.sampling_rate_text = epgTable.sampling_rate[descriptor.sampling_rate];

                        break;
                }
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

        var objService = this.epg[onid][tsid][sid];

        return objService.pf.hasOwnProperty("present");
    }

    isFollowing(onid, tsid, sid) {
        if (!this.epg.hasOwnProperty(onid)) return false;
        if (!this.epg[onid].hasOwnProperty(tsid)) return false;
        if (!this.epg[onid][tsid].hasOwnProperty(sid)) return false;

        var objService = this.epg[onid][tsid][sid];

        return objService.pf.hasOwnProperty("following");
    }

    isSchedule() {
        return Object.keys(this.epg).every(onid => {
            return Object.keys(this.epg[onid]).every(tsid => {
                return Object.keys(this.epg[onid][tsid]).every(sid => {
                    var objService = this.epg[onid][tsid][sid];

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

        var objService = this.epg[onid][tsid][sid];

        return objService.pf.present;
    }

    getFollowing(onid, tsid, sid) {
        if (!this.epg.hasOwnProperty(onid)) return {};
        if (!this.epg[onid].hasOwnProperty(tsid)) return {};
        if (!this.epg[onid][tsid].hasOwnProperty(sid)) return {};

        var objService = this.epg[onid][tsid][sid];

        return objService.pf.following;
    }

    getSchedule() {
        var objSchedule = {};

        Object.keys(this.epg).forEach(onid => {
            objSchedule[onid] = {};

            return Object.keys(this.epg[onid]).forEach(tsid => {
                objSchedule[onid][tsid] = {};

                return Object.keys(this.epg[onid][tsid]).forEach(sid => {
                    var objService = this.epg[onid][tsid][sid];

                    objSchedule[onid][tsid][sid] = objService.schedule;
                });
            });
        });

        return objSchedule;
    }
}

module.exports = TsEpg;
