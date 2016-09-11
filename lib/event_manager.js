"use strict";

const TsDate = require("./date");
const TsEvent = require("./event");
const TsUtil = require("./util");
const TsBase = require("./base");

class TsEventManager extends TsBase {
    constructor() {
        super();

        this.versions = {};

        this.events = {};
        this.time = null;
    }

    process(tsSection) {
        const tableId = tsSection.getTableId();

        if (tableId >= 0x4E && tableId <= 0x6F) {
            // Event information
            this.onEit(tsSection);
        } else if (tableId === 0x70) {
            // Time and date
            this.onTdt(tsSection);
        } else if (tableId === 0x73) {
            // Time offset
            this.onTot(tsSection);
        }
    }

    onEit(tsSection) {
        // Select H-EIT
        if (tsSection.getPid() !== 0x12) return;

        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();
        const onid = tsSection.getOriginalNetworkId();
        const tsid = tsSection.getTransportStreamId();
        const sid = tsSection.getServiceId();
        const subTable = TsUtil.getNestedObject(this.versions, [tableId, onid, tsid, sid]);
        const isUpdated = TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        const objSection = tsSection.decode();

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        if (Object.keys(service).length === 0) {
            service.pf = {
                present: null,
                following: null
            };

            service.schedule = {};

            service.basic = {
                flag: Buffer.alloc(0x100, 0x00),
                ignore: Buffer.alloc(0x100, 0xFF)
            };

            service.extended = {
                flag: Buffer.alloc(0x100, 0x00),
                ignore: Buffer.alloc(0x100, 0xFF)
            };
        }

        for (let i = 0, l = objSection.events.length; i < l; i++) {
            const _event = objSection.events[i];

            let tsEvent;

            // Check schedule
            if (service.schedule.hasOwnProperty(_event.event_id)) {
                tsEvent = service.schedule[_event.event_id];
            } else {
                tsEvent = new TsEvent();

                service.schedule[_event.event_id] = tsEvent;
            }

            // Set section
            tsEvent.setSection(objSection);

            // Set event
            tsEvent.setEvent(_event);

            // Check p/f
            if (objSection.table_id === 0x4E || objSection.table_id === 0x4F) {
                if (objSection.section_number === 0) {
                    // Set present
                    service.pf.present = tsEvent;

                    // Emit "present"
                    this.emit("present", tsEvent);
                } else if (objSection.section_number === 1) {
                    // Set following
                    service.pf.following = tsEvent;

                    // Emit "following"
                    this.emit("following", tsEvent);
                }
            } else {
                // Emit "schedule"
                this.emit("schedule", tsEvent);
            }
        }

        if (objSection.table_id !== 0x4E && objSection.table_id !== 0x4F) {
            const target = (objSection.table_id & 0x0F) < 0x08 ? service.basic : service.extended;
            const tableNumber = objSection.table_id & 0x07;
            const segmentNumber = objSection.section_number >> 3;
            const sectionNumber = objSection.section_number & 0x07;
            const tableOffset = tableNumber << 5;
            const segmentOffset = tableOffset + segmentNumber;

            if (isUpdated) {
                // Update table
                for (let _segmentOffset = tableNumber << 5, l = (tableNumber + 1) << 5; _segmentOffset < l ; _segmentOffset++) {
                    target.flag[_segmentOffset] = 0x00;
                    target.ignore[_segmentOffset] = 0x00;
                }

                // Update excluded tables
                const lastTableNumber = objSection.last_table_id & 0x07;

                for (let _segmentOffset = (lastTableNumber + 1) << 5; _segmentOffset < 0x100 ; _segmentOffset++) {
                    target.ignore[_segmentOffset] = 0xFF;
                }

                // Update excluded segments
                const lastSegmentNumber = objSection.last_section_number >> 3;

                for (let _segmentOffset = tableOffset + lastSegmentNumber + 1, l = tableOffset + 0x20; _segmentOffset < l ; _segmentOffset++) {
                    target.ignore[_segmentOffset] = 0xFF;
                }
            }

            if (this.time !== null) {
                // Update past segment
                const currentSegmentOffset = (this.time.getTime() - this.time.getTimezoneOffset() * 60 * 1000) / (3 * 60 * 60 * 1000) & 0x07;

                for (let _segmentOffset = 0; _segmentOffset < currentSegmentOffset; _segmentOffset++) {
                    target.ignore[_segmentOffset] = 0xFF;
                }
            }

            if (target.flag[segmentOffset] === 0x00) {
                // Update excluded section
                const lastSectionNumber = objSection.segment_last_section_number & 0x07;

                for (let _sectionNumber = lastSectionNumber + 1; _sectionNumber < 0x08; _sectionNumber++) {
                    target.ignore[segmentOffset] |= 1 << _sectionNumber;
                }
            }

            // Update flag field
            target.flag[segmentOffset] |= 1 << sectionNumber;
        }

        // Emit "update"
        this.emit("update", tableId, onid, tsid, sid);
    }

    onTdt(tsSection) {
        const objSection = tsSection.decode();

        this.time = new TsDate(objSection.JST_time).decode();
    }

    onTot(tsSection) {
        const objSection = tsSection.decode();

        this.time = new TsDate(objSection.JST_time).decode();
    }

    hasPresent(onid, tsid, sid) {
        if (!TsUtil.checkNestedObject(this.events, [onid, tsid, sid])) return false;

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        return service.pf.present !== null;
    }

    hasFollowing(onid, tsid, sid) {
        if (!TsUtil.checkNestedObject(this.events, [onid, tsid, sid])) return false;

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        return service.pf.following !== null;
    }

    hasSchedule(onid, tsid, sid) {
        if (!TsUtil.checkNestedObject(this.events, [onid, tsid, sid])) return false;

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        for (let i = 0; i < 2; i++) {
            const target = i === 0 ? service.basic : service.extended;

            for (let j = 0; j < 0x100; j++) {
                if ((target.flag[j] | target.ignore[j]) !== 0xFF) return false;
            }
        }

        return true;
    }

    hasSchedules() {
        for (let keys = Object.keys(this.events), i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];
            const originalNetwork = this.events[key];

            for (let keys2 = Object.keys(originalNetwork), j = 0, l2 = keys2.length; j < l2; j++) {
                const key2 = keys2[j];
                const transportStream = originalNetwork[key2];

                for (let keys3 = Object.keys(transportStream), k = 0, l3 = keys3.length; k < l3; k++) {
                    const key3 = keys3[k];
                    const service = transportStream[key3];

                    for (let m = 0; m < 2; m++) {
                        const target = m === 0 ? service.basic : service.extended;

                        for (let n = 0; n < 0x100; n++) {
                            if ((target.flag[n] | target.ignore[n]) !== 0xFF) return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    getPresent(onid, tsid, sid) {
        if (!TsUtil.checkNestedObject(this.events, [onid, tsid, sid])) return null;

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        return service.pf.present;
    }

    getFollowing(onid, tsid, sid) {
        if (!TsUtil.checkNestedObject(this.events, [onid, tsid, sid])) return null;

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        return service.pf.following;
    }

    getSchedule(onid, tsid, sid) {
        if (!TsUtil.checkNestedObject(this.events, [onid, tsid, sid])) return null;

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        return service.schedule;
    }

    getSchedules() {
        const schedules = {};

        for (let keys = Object.keys(this.events), i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];
            const originalNetwork = this.events[key];

            schedules[key] = {};

            for (let keys2 = Object.keys(originalNetwork), j = 0, l2 = keys2.length; j < l2; j++) {
                const key2 = keys2[j];
                const transportStream = originalNetwork[key2];

                schedules[key][key2] = {};

                for (let keys3 = Object.keys(transportStream), k = 0, l3 = keys3.length; k < l3; k++) {
                    const key3 = keys3[k];
                    const service = transportStream[key3];

                    schedules[key][key2][key3] = service.schedule;
                }
            }
        }

        return schedules;
    }

    getScheduleAmount(onid, tsid, sid) {
        let overall = 0;
        let stored = 0;

        if (!TsUtil.checkNestedObject(this.events, [onid, tsid, sid])) return [stored, overall];

        const service = TsUtil.getNestedObject(this.events, [onid, tsid, sid]);

        for (let i = 0; i < 2; i++) {
            const target = i === 0 ? service.basic : service.extended;

            for (let j = 0; j < 0x100; j++) {
                for (let k = 0; k < 0x08; k++) {
                    if ((target.flag[j] >> k & 0x01) === 1) {
                        stored++;
                        overall++;
                    } else if (((target.ignore[j] ^ 0xFF) >> k & 0x01) === 1) {
                        overall++;
                    }
                }
            }
        }

        return [stored, overall];
    }

    getSchedulesAmount() {
        let overall = 0;
        let stored = 0;

        for (let keys = Object.keys(this.events), i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];
            const originalNetwork = this.events[key];

            for (let keys2 = Object.keys(originalNetwork), j = 0, l2 = keys2.length; j < l2; j++) {
                const key2 = keys2[j];
                const transportStream = originalNetwork[key2];

                for (let keys3 = Object.keys(transportStream), k = 0, l3 = keys3.length; k < l3; k++) {
                    const key3 = keys3[k];
                    const service = transportStream[key3];

                    for (let m = 0; m < 2; m++) {
                        const target = m === 0 ? service.basic : service.extended;

                        for (let n = 0; n < 0x100; n++) {
                            for (let o = 0; o < 0x08; o++) {
                                if ((target.flag[n] >> o & 0x01) === 1) {
                                    stored++;
                                    overall++;
                                } else if (((target.ignore[n] ^ 0xFF) >> o & 0x01) === 1) {
                                    overall++;
                                }
                            }
                        }
                    }
                }
            }
        }

        return [stored, overall];
    }
}

module.exports = TsEventManager;
