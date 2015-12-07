"use strict";

const TsDate = require("./date");
const TsEpg = require("./epg");

class TsUtil {
    constructor() {
        this.original_network_id = -1;
        this.transport_stream_id = -1;
        this.service_ids = [];

        this.time = null;
        this.epg = new TsEpg();

        this.pat = null;
        this.cat = null;
        this.pmt = {};
        this.nit = {};
        this.sdt = {};
        this.bat = {};
    }

    addPat(pid, objPat) {
        if (this.pat !== null && objPat.version_number === this.pat.version_number) {
            return true;
        }

        this.pat = objPat;

        return true;
    }

    addCat(pid, objCat) {
        if (this.cat !== null && objCat.version_number === this.cat.version_number) {
            return true;
        }

        this.cat = objCat;

        return true;
    }

    addPmt(pid, objPmt) {
        if (this.pmt.hasOwnProperty(pid) && objPmt.version_number === this.pmt[pid].version_number) {
            return true;
        }

        this.pmt[pid] = objPmt;

        return true;
    }

    addNit(pid, objNit) {
        if (this.nit.hasOwnProperty(pid) && objNit.version_number === this.nit[objNit.network_id].version_number) {
            return true;
        }

        this.nit[objNit.network_id] = objNit;

        return true;
    }

    addSdt(pid, objSdt) {
        if (this.sdt.hasOwnProperty(pid) && objSdt.version_number === this.sdt[objSdt.transport_stream_id].version_number) {
            return true;
        }

        this.sdt[objSdt.transport_stream_id] = objSdt;

        if (objSdt.table_id === 0x42) {
            this.original_network_id = objSdt.original_network_id;
            this.transport_stream_id = objSdt.transport_stream_id;
            this.service_ids = objSdt.services.map(service => service.service_id);
        }

        return true;
    }

    addBat(pid, objBat) {
        if (this.bat.hasOwnProperty(pid) && objBat.version_number === this.sdt[objBat.bouquet_id].version_number) {
            return true;
        }

        this.bat[objBat.bouquet_id] = objBat;

        return true;
    }

    addEit(pid, objEit) {
        return this.epg.addEit(pid, objEit);
    }

    addTdt(pid, objTdt) {
        this.time = new TsDate(objTdt.JST_time).decode();

        return true;
    }

    addTot(pid, objTot) {
        this.time = new TsDate(objTot.JST_time).decode();

        return true;
    }

    isOriginalNetworkId() {
        return this.original_network_id !== -1;
    }

    isTransportStreamId() {
        return this.transport_stream_id !== -1;
    }

    isServiceIds() {
        return this.service_ids.length !== 0;
    }

    isPresent(onid, tsid, sid) {
        return this.epg.isPresent(onid, tsid, sid);
    }

    isFollowing(onid, tsid, sid) {
        return this.epg.isFollowing(onid, tsid, sid);
    }

    isSchedule() {
        return this.epg.isSchedule();
    }

    isTime() {
        return this.time !== null;
    }

    getOriginalNetworkId() {
        return this.original_network_id;
    }

    getTransportStreamId() {
        return this.transport_stream_id;
    }

    getServiceIds() {
        return this.service_ids;
    }

    getPresent(onid, tsid, sid) {
        return this.epg.getPresent(onid, tsid, sid);
    }

    getFollowing(onid, tsid, sid) {
        return this.epg.getFollowing(onid, tsid, sid);
    }

    getSchedule() {
        return this.epg.getSchedule();
    }

    getTime() {
        return this.time;
    }
}

module.exports = TsUtil;
