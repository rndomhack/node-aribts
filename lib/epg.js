"use strict";

const TsChar = require("./char");
const TsDate = require("./date");

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
                    current: new Buffer(32),
                    end: new Buffer(32)
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

                objEvent.shortEvent = null;
                objEvent.extendedEvent = null;

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
                shortEvent: this.needUpdate(objEvent.shortEvent, objEvent),
                extendedEvent: this.needUpdate(objEvent.extendedEvent, objEvent)
            };

            event.descriptors.forEach(descriptor => {
                switch (descriptor.descriptor_tag) {
                    case 0x4D:
                        // Short event
                        if (!needUpdate.shortEvent) break;

                        if (objEvent.shortEvent === null) {
                            objEvent.shortEvent = {};
                        }

                        objEvent.shortEvent.table_id = objEit.table_id;
                        objEvent.shortEvent.version_number = objEit.version_number;

                        objEvent.shortEvent.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        objEvent.shortEvent.event_name = new TsChar(descriptor.event_name_char).decode();
                        objEvent.shortEvent.text = new TsChar(descriptor.text_char).decode();

                        break;

                    case 0x4E:
                        // Extended event
                        if (!needUpdate.extendedEvent) break;

                        if (objEvent.extendedEvent === null) {
                            objEvent.extendedEvent = {};
                        }

                        objEvent.extendedEvent.table_id = objEit.table_id;
                        objEvent.extendedEvent.version_number = objEit.version_number;

                        objEvent.extendedEvent.ISO_639_language_code = String.fromCharCode(...descriptor.ISO_639_language_code);
                        objEvent.extendedEvent.items = objEvent.extendedEvent.items || {};
                        objEvent.extendedEvent.text = new TsChar(descriptor.text_char).decode();

                        descriptor.items.forEach(item => {
                            if (item.item_description_length && item_description !== null) {
                                objEvent.extendedEvent.items[item_description] = new TsChar(Buffer.concat(objEvent.extendedEvent.items[item_description])).decode();
                            }

                            if (item.item_description_length) {
                                item_description = new TsChar(item.item_description_char).decode();

                                objEvent.extendedEvent.items[item_description] = [];
                            }

                            objEvent.extendedEvent.items[item_description].push(item.item_char);

                            if (descriptor.descriptor_number === descriptor.last_descriptor_number) {
                                objEvent.extendedEvent.items[item_description] = new TsChar(Buffer.concat(objEvent.extendedEvent.items[item_description])).decode();
                            }
                        });

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
