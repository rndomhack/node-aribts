"use strict";

const TsChar = require("./char");
const TsDate = require("./date");
const TsEpg = require("./epg");

class TsUtil {
    constructor() {
        this.original_network_id = -1;
        this.transport_stream_id = -1;
        this.service_ids = [];

        this.transport_streams = {};
        this.services = {};
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

        this.service_ids = objPat.programs.map(program => program.program_number)
                                          .filter(service_id => service_id !== 0);

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
        if (this.nit.hasOwnProperty(objNit.network_id) && objNit.version_number === this.nit[objNit.network_id].version_number) {
            return true;
        }

        this.nit[objNit.network_id] = objNit;

        if (objNit.table_id === 0x40) {
            objNit.transport_streams.forEach(transport_stream => {
                let _transport_stream = {};

                _transport_stream.transport_stream_id = transport_stream.transport_stream_id;
                _transport_stream.original_network_id = transport_stream.original_network_id;
                _transport_stream.services = null;
                _transport_stream.satellite_delivery_system = null;
                _transport_stream.terrestrial_delivery_system = null;

                transport_stream.transport_descriptors.forEach(descriptor => {
                    switch (descriptor.descriptor_tag) {
                        case 0x41:
                            // Service list
                            _transport_stream.services = {};

                            descriptor.services.forEach(service => {
                                let _service = {};

                                _service.service_id = service.service_id;
                                _service.service_type = service.service_type;

                                _transport_stream.services[service.service_id] = _service;
                            });

                            break;

                        case 0x43:
                            // Satellite delivery system
                            _transport_stream.satellite_delivery_system = {};

                            _transport_stream.satellite_delivery_system.frequency = descriptor.frequency;
                            _transport_stream.satellite_delivery_system.orbital_position = descriptor.orbital_position;
                            _transport_stream.satellite_delivery_system.west_east_flag = descriptor.west_east_flag;
                            _transport_stream.satellite_delivery_system.polarisation = descriptor.polarisation;
                            _transport_stream.satellite_delivery_system.modulation = descriptor.modulation;
                            _transport_stream.satellite_delivery_system.symbol_rate = descriptor.symbol_rate;
                            _transport_stream.satellite_delivery_system.FEC_inner = descriptor.FEC_inner;

                            break;

                        case 0xFA:
                            // Terrestrial delivery system
                            _transport_stream.terrestrial_delivery_system = {};

                            _transport_stream.terrestrial_delivery_system.area_code = descriptor.area_code;
                            _transport_stream.terrestrial_delivery_system.guard_interval = descriptor.guard_interval;
                            _transport_stream.terrestrial_delivery_system.transmission_mode = descriptor.transmission_mode;
                            _transport_stream.terrestrial_delivery_system.frequencies = descriptor.frequencies;

                            break;
                    }
                });

                this.transport_streams[transport_stream.transport_stream_id] = _transport_stream;
            });
        }

        return true;
    }

    addSdt(pid, objSdt) {
        if (this.sdt.hasOwnProperty(objSdt.transport_stream_id) && objSdt.version_number === this.sdt[objSdt.transport_stream_id].version_number) {
            return true;
        }

        this.sdt[objSdt.transport_stream_id] = objSdt;

        if (objSdt.table_id === 0x42) {
            this.original_network_id = objSdt.original_network_id;
            this.transport_stream_id = objSdt.transport_stream_id;

            objSdt.services.forEach(service => {
                let _service = {};

                _service.service_id = service.service_id;
                _service.running_status = service.running_status;
                _service.free_CA_mode = service.free_CA_mode;
                _service.service = null;

                service.descriptors.forEach(descriptor => {
                    switch (descriptor.descriptor_tag) {
                        case 0x48:
                            // Service
                            _service.service = {};

                            _service.service.service_type = descriptor.service_type;
                            _service.service.service_provider_name = new TsChar(descriptor.service_provider_name_char).decode();
                            _service.service.service_name = new TsChar(descriptor.service_name_char).decode();

                            break;
                    }
                });

                this.services[service.service_id] = _service;
            });
        }

        return true;
    }

    addBat(pid, objBat) {
        if (this.bat.hasOwnProperty(objBat.bouquet_id) && objBat.version_number === this.sdt[objBat.bouquet_id].version_number) {
            return true;
        }

        this.bat[objBat.bouquet_id] = objBat;

        return true;
    }

    addEit(pid, objEit) {
        return this.epg.addEit(pid, objEit, this.time);
    }

    addTdt(pid, objTdt) {
        this.time = new TsDate(objTdt.JST_time).decode();

        return true;
    }

    addTot(pid, objTot) {
        this.time = new TsDate(objTot.JST_time).decode();

        return true;
    }

    isTransportStreams() {
        return Object.keys(this.transport_streams).length !== 0;
    }

    isServices() {
        return Object.keys(this.services).length !== 0;
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

    getTransportStreams() {
        return this.transport_streams;
    }

    getServices() {
        return this.services;
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
