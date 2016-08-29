"use strict";

const TsChar = require("./char");
const TsDate = require("./date");
const TsEpg = require("./epg");
const TsLogo = require("./logo");
const tsDataModule = require("./data_module");

function checkNestedObject(obj, keys) {
    return keys.every(key => {
        if (!obj.has(key)) return false;

        obj = obj.get(key);

        return true;
    });
}

function getNestedObject(obj, keys) {
    keys.forEach((key, i) => {
        if (!obj.has(key)) {
            obj.set(key, i === keys.length - 1 ? {} : new Map());
        }

        obj = obj.get(key);
    });

    return obj;
}

function removeNestedObject(obj, keys) {
    return keys.every((key, i) => {
        if (!obj.has(key)) return false;

        if (i === keys.length - 1) {
            obj.delete(key);
        } else {
            obj = obj.get(key);
        }

        return true;
    });
}

function updateSubTable(subTable, objTable) {
    if (Object.keys(subTable).length === 0 || objTable.version_number !== subTable.version_number) {
        subTable.version_number = objTable.version_number;
        subTable.last_section_number = objTable.last_section_number;
        subTable.sections = new Set();

        return true;
    }

    return false;
}

function updateSection(subTable, objTable) {
    if (subTable.sections.has(objTable.section_number)) {
        return false;
    }

    subTable.sections.add(objTable.section_number);

    return true;
}

function checkSections(subTable) {
    return subTable.sections.size === subTable.last_section_number + 1;
}

class TsUtil {
    constructor() {
        this.reset();
    }

    reset() {
        this.original_network_id = -1;
        this.transport_stream_id = -1;
        this.service_ids = null;

        this.transport_streams = new Map();
        this.services = new Map();

        this.epg = new TsEpg();

        this.time = null;

        this.download_data_ids = new Map();
        this.download_ids = new Map();

        this.logo_ids = new Map();
        this.logo_id_refs = new Map();

        this.versions = {
            pat: new Map(),
            cat: new Map(),
            pmt: new Map(),
            dsmcc: new Map(),
            nit: new Map(),
            sdt: new Map(),
            bat: new Map(),
            sdtt: new Map(),
            cdt: new Map()
        };
    }

    addPat(pid, objPat) {
        if (pid !== 0x00) return false;
        if (objPat.table_id !== 0x00) return false;
        if (objPat.current_next_indicator === 0) return false;

        let subTable = getNestedObject(this.versions.pat, [objPat.table_id]);

        let isUpdated = updateSubTable(subTable, objPat);

        if (!updateSection(subTable, objPat)) return false;

        if (this.service_ids === null) {
            this.service_ids = {};
        }

        let service_ids = this.service_ids;

        if (Object.keys(service_ids).length === 0 || isUpdated) {
            service_ids.content = new Set();
            service_ids.flag = false;
        }

        objPat.programs.forEach(program => {
            if (program.program_number === 0) return;

            service_ids.content.add(program.program_number);
        });

        if (checkSections(subTable)) {
            service_ids.flag = true;
        }

        return true;
    }

    addCat(pid, objCat) {
        if (pid !== 0x01) return false;
        if (objCat.table_id !== 0x01) return false;
        if (objCat.current_next_indicator === 0) return false;

        // Nothing

        return true;
    }

    addPmt(pid, objPmt) {
        if (objPmt.table_id !== 0x02) return false;
        if (objPmt.current_next_indicator === 0) return false;

        // Nothing

        return true;
    }

    addDsmcc(pid, objDsmcc) {
        if (objDsmcc.table_id !== 0x3B && objDsmcc.table_id !== 0x3C) return false;
        if (objDsmcc.current_next_indicator === 0) return true;

        let subTable = getNestedObject(this.versions.dsmcc, [objDsmcc.table_id, objDsmcc.table_id_extension]);

        let isUpdated = updateSubTable(subTable, objDsmcc);

        if (!updateSection(subTable, objDsmcc)) return false;

        switch (objDsmcc.table_id) {
            case 0x3B: {
                // DII
                let objDii = objDsmcc.message;

                if (!checkNestedObject(this.download_ids, [objDii.downloadId])) {
                    return false;
                }

                let download_id = getNestedObject(this.download_ids, [objDii.downloadId]);

                if (Object.keys(download_id).length === 0 || isUpdated) {
                    download_id.modules = new Map();
                    download_id.numberOfModules = objDii.numberOfModules;
                    download_id.blockSize = objDii.blockSize;
                }

                for (let module of objDii.modules) {
                    let _module = getNestedObject(download_id.modules, [module.moduleId]);

                    _module.blocks = [];
                    _module.blockCount = 0;
                    _module.numberOfBlocks = Math.ceil(module.moduleSize / objDii.blockSize);
                    _module.dataModuleByte = null;
                    _module.moduleSize = module.moduleSize;
                    _module.moduleVersion = module.moduleVersion;
                    _module.type = null;
                    _module.name = null;
                    _module.info = null;
                    _module.flag = false;

                    for (let descriptor of module.moduleInfo) {
                        switch (descriptor.descriptor_tag) {
                            case 0x01:
                                // Type
                                _module.type = new TsChar(descriptor.text_char);

                                break;

                            case 0x02:
                                // Name
                                _module.name = new TsChar(descriptor.text_char);

                                break;

                            case 0x03:
                                // Info
                                _module.info = new TsChar(descriptor.text_char);

                                break;
                        }
                    }
                }

                break;
            }

            case 0x3C: {
                // DDB
                let objDdb = objDsmcc.message;

                if (!checkNestedObject(this.download_ids, [objDdb.downloadId])) {
                    return false;
                }

                let download_id = getNestedObject(this.download_ids, [objDdb.downloadId]);

                if (Object.keys(download_id).length === 0) {
                    return false;
                }

                if (!checkNestedObject(download_id.modules, [objDdb.moduleId])) {
                    return false;
                }

                let module = getNestedObject(download_id.modules, [objDdb.moduleId]);

                if (objDdb.moduleVersion !== module.moduleVersion) return false;
                if (module.blocks.hasOwnProperty(objDdb.blockNumber)) return false;

                module.blocks[objDdb.blockNumber] = objDdb.blockDataByte;
                module.blockCount++;

                if (module.blockCount === module.numberOfBlocks) {
                    let dataModuleByte = Buffer.concat(module.blocks);

                    if (dataModuleByte.length === module.moduleSize) {
                        module.dataModuleByte = dataModuleByte;
                        module.flag = true;
                    } else {
                        module.blocks.length = 0;
                        module.blockCount = 0;
                    }
                }

                if (download_id.modules.every(_module => _module.flag)) {
                    for (let _module of download_id.modules) {
                        switch (_module.name) {
                            case "LOGO-00":
                            case "LOGO-01":
                            case "LOGO-02":
                            case "LOGO-03":
                            case "LOGO-04":
                            case "LOGO-05":
                            case "CS_LOGO-00":
                            case "CS_LOGO-01":
                            case "CS_LOGO-02":
                            case "CS_LOGO-03":
                            case "CS_LOGO-04":
                            case "CS_LOGO-05": {
                                // Logo
                                let dataModule = new tsDataModule.TsDataModuleLogo(_module.dataModuleByte).decode();

                                for (let logo of dataModule.logos) {
                                    let original_network_ids = new Set();

                                    for (let service of logo.services) {
                                        original_network_ids.add(service.original_network_id);

                                        let logo_id_ref = getNestedObject(this.logo_id_refs, [service.original_network_id, service.transport_stream_id, service.service_id]);

                                        logo_id_ref.logo_id = logo.logo_id;
                                    }

                                    if (original_network_ids.size === 0) continue;

                                    for (let original_network_id of original_network_ids) {
                                        let logo_id = getNestedObject(this.logo_ids, [original_network_id, logo.logo_id]);

                                        if (Object.keys(logo_id).length === 0 || _module.moduleVersion !== logo_id.version) {
                                            logo_id.content = new Map();
                                            logo_id.version = _module.moduleVersion;
                                            logo_id.flag = false;
                                        }

                                        if (logo_id.flag) continue;

                                        let logoData = new TsLogo(logo.data_byte).decode();

                                        logo_id.content.set(dataModule.logo_type, logoData);

                                        if (logo_id.content.size === 6) {
                                            logo_id.flag = true;
                                        }
                                    }
                                }

                                break;
                            }
                        }
                    }

                    removeNestedObject(this.download_ids, [objDdb.downloadId]);
                }

                break;
            }
        }

        return true;
    }

    addNit(pid, objNit) {
        if (pid !== 0x10) return false;
        if (objNit.table_id !== 0x40 && objNit.table_id !== 0x41) return false;
        if (objNit.current_next_indicator === 0) return false;

        let subTable = getNestedObject(this.versions.nit, [objNit.table_id, objNit.network_id]);

        let isUpdated = updateSubTable(subTable, objNit);

        if (!updateSection(subTable, objNit)) return false;

        if (objNit.table_id === 0x40) {
            this.original_network_id = objNit.network_id;
        }

        let transport_streams = getNestedObject(this.transport_streams, [objNit.network_id]);

        if (Object.keys(transport_streams).length === 0 || isUpdated) {
            transport_streams.content = new Map();
            transport_streams.flag = false;
        }

        for (let transport_stream of objNit.transport_streams) {
            let _transport_stream = {};

            _transport_stream.transport_stream_id = transport_stream.transport_stream_id;
            _transport_stream.original_network_id = transport_stream.original_network_id;
            _transport_stream.services = null;
            _transport_stream.satellite_delivery_system = null;
            _transport_stream.terrestrial_delivery_system = null;

            for (let descriptor of transport_stream.transport_descriptors) {
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
            }

            transport_streams.content.set(transport_stream.transport_stream_id, _transport_stream);
        }

        if (checkSections(subTable)) {
            transport_streams.flag = true;
        }

        return true;
    }

    addSdt(pid, objSdt) {
        if (pid !== 0x11) return false;
        if (objSdt.table_id !== 0x42 && objSdt.table_id !== 0x46) return false;
        if (objSdt.current_next_indicator === 0) return false;

        let subTable = getNestedObject(this.versions.sdt, [objSdt.table_id, objSdt.original_network_id, objSdt.transport_stream_id]);

        let isUpdated = updateSubTable(subTable, objSdt);

        if (!updateSection(subTable, objSdt)) return false;

        if (objSdt.table_id === 0x42) {
            this.transport_stream_id = objSdt.transport_stream_id;
        }

        let services = getNestedObject(this.services, [objSdt.original_network_id, objSdt.transport_stream_id]);

        if (Object.keys(services).length === 0 || isUpdated) {
            services.content = new Map();
            services.flag = false;
        }

        for (let service of objSdt.services) {
            let _service = {};

            _service.service_id = service.service_id;
            _service.running_status = service.running_status;
            _service.free_CA_mode = service.free_CA_mode;
            _service.service = null;

            for (let descriptor of service.descriptors) {
                switch (descriptor.descriptor_tag) {
                    case 0x48:
                        // Service
                        _service.service = {};

                        _service.service.service_type = descriptor.service_type;
                        _service.service.service_provider_name = new TsChar(descriptor.service_provider_name_char).decode();
                        _service.service.service_name = new TsChar(descriptor.service_name_char).decode();

                        break;

                    case 0xCF:
                        // Logo transmission
                        _service.logo_transmission = {};

                        _service.logo_transmission.logo_transmission_type = descriptor.logo_transmission_type;

                        if (descriptor.logo_transmission_type === 1) {
                            _service.logo_transmission.logo_id = descriptor.logo_id;
                            _service.logo_transmission.logo_version = descriptor.logo_version;
                            _service.logo_transmission.download_data_id = descriptor.download_data_id;
                        } else if (descriptor.logo_transmission_type === 2) {
                            _service.logo_transmission.logo_id = descriptor.logo_id;
                        } else if (descriptor.logo_transmission_type === 3) {
                            _service.logo_transmission.logo_char = descriptor.logo_char;
                        }

                        if (descriptor.logo_transmission_type < 3) {
                            let logo_id_ref = getNestedObject(this.logo_id_refs, [objSdt.original_network_id, objSdt.transport_stream_id, service.service_id]);

                            logo_id_ref.logo_id = descriptor.logo_id;

                            if (descriptor.logo_transmission_type === 1) {
                                let download_data_id = getNestedObject(this.download_data_ids, [objSdt.original_network_id, descriptor.download_data_id]);

                                if (Object.keys(download_data_id).length === 0) {
                                    download_data_id.flag = false;
                                }
                            }
                        }

                        break;
                }
            }

            services.content.set(service.service_id, _service);
        }

        if (checkSections(subTable)) {
            services.flag = true;
        }

        return true;
    }

    addBat(pid, objBat) {
        if (pid !== 0x11) return false;
        if (objBat.table_id !== 0x4A) return false;
        if (objBat.current_next_indicator === 0) return true;

        // Nothing

        return true;
    }

    addEit(pid, objEit) {
        return this.epg.addEit(pid, objEit, this.time);
    }

    addTdt(pid, objTdt) {
        if (pid !== 0x14) return false;
        if (objTdt.table_id !== 0x70) return false;

        this.time = new TsDate(objTdt.JST_time).decode();

        return true;
    }

    addTot(pid, objTot) {
        if (pid !== 0x14) return false;
        if (objTot.table_id !== 0x73) return false;

        this.time = new TsDate(objTot.JST_time).decode();

        return true;
    }

    addSdtt(pid, objSdtt) {
        if (pid !== 0x23 && pid !== 0x28) return false;
        if (objSdtt.table_id !== 0xC3) return false;
        if (objSdtt.table_id_ext >> 8 !== 0xFF) return false;
        if (objSdtt.current_next_indicator === 0) return false;

        let subTable = getNestedObject(this.versions.sdtt, [objSdtt.table_id, objSdtt.table_id_ext]);

        updateSubTable(subTable, objSdtt);

        if (!updateSection(subTable, objSdtt)) return false;

        for (let content of objSdtt.contents) {
            for (let descriptor of content.descriptors) {
                switch (descriptor.descriptor_tag) {
                    case 0xC9:
                        // Download Content
                        getNestedObject(this.download_ids, [descriptor.download_id]);

                        break;
                }
            }
        }

        return true;
    }

    addCdt(pid, objCdt) {
        if (pid !== 0x29) return false;
        if (objCdt.table_id !== 0xC8) return false;
        if (objCdt.current_next_indicator === 0) return false;

        let subTable = getNestedObject(this.versions.cdt, [objCdt.table_id, objCdt.original_network_id, objCdt.download_data_id]);

        updateSubTable(subTable, objCdt);

        if (!updateSection(subTable, objCdt)) return false;

        if (!checkNestedObject(this.download_data_ids, [objCdt.original_network_id, objCdt.download_data_id])) {
            return false;
        }

        switch (objCdt.data_type) {
            case 0x01: {
                // Logo
                let dataModule = new tsDataModule.TsDataModuleCdtLogo(objCdt.data_module_byte).decode();

                let logo_id = getNestedObject(this.logo_ids, [objCdt.original_network_id, dataModule.logo_id]);

                if (Object.keys(logo_id).length === 0 || dataModule.logo_version !== logo_id.version) {
                    logo_id.content = new Map();
                    logo_id.version = dataModule.logo_version;
                    logo_id.flag = false;
                }

                if (logo_id.flag) return false;

                let logoData = new TsLogo(dataModule.data_byte).decode();

                logo_id.content.set(dataModule.logo_type, logoData);

                if (logo_id.content.size === 6) {
                    logo_id.flag = true;
                }

                break;
            }
        }

        if (checkSections(subTable)) {
            removeNestedObject(this.download_data_ids, [objCdt.original_network_id, objCdt.download_data_id]);
        }

        return true;
    }

    hasTransportStreams(onid) {
        onid = onid || this.original_network_id;

        if (!checkNestedObject(this.transport_streams, [onid])) return false;

        let transport_streams = getNestedObject(this.transport_streams, [onid]);

        if (!transport_streams.flag) return false;

        return true;
    }

    hasServices(onid, tsid) {
        onid = onid || this.original_network_id;
        tsid = tsid || this.transport_stream_id;

        if (!checkNestedObject(this.services, [onid, tsid])) return false;

        let services = getNestedObject(this.services, [onid, tsid]);

        if (!services.flag) return false;

        return true;
    }

    hasOriginalNetworkId() {
        return this.original_network_id !== -1;
    }

    hasTransportStreamId() {
        return this.transport_stream_id !== -1;
    }

    hasServiceIds() {
        if (this.service_ids === null) return false;

        let service_ids = this.service_ids;

        if (!service_ids.flag) return false;

        return true;
    }

    hasPresent(onid, tsid, sid) {
        return this.epg.hasPresent(onid, tsid, sid);
    }

    hasFollowing(onid, tsid, sid) {
        return this.epg.hasFollowing(onid, tsid, sid);
    }

    hasSchedule() {
        return this.epg.hasSchedule();
    }

    hasTime() {
        return this.time !== null;
    }

    hasLogoId(onid, tsid, sid) {
        return checkNestedObject(this.logo_id_refs, [onid, tsid, sid]);
    }

    hasLogo(logo_id, onid) {
        if (!checkNestedObject(this.logo_ids, [onid, logo_id])) return false;

        let logos = getNestedObject(this.logo_ids, [onid, logo_id]);

        if (!logos.flag) return false;

        return true;
    }

    getTransportStreams(onid) {
        onid = onid || this.original_network_id;

        if (!checkNestedObject(this.transport_streams, [onid])) return null;

        let transport_streams = getNestedObject(this.transport_streams, [onid]);

        let obj = {};

        for (let transport_stream of transport_streams.content) {
            obj[transport_stream[0]] = transport_stream[1];
        }

        return obj;
    }

    getServices(onid, tsid) {
        onid = onid || this.original_network_id;
        tsid = tsid || this.transport_stream_id;

        if (!checkNestedObject(this.services, [onid, tsid])) return null;

        let services = getNestedObject(this.services, [onid, tsid]);

        let obj = {};

        for (let service of services.content) {
            obj[service[0]] = service[1];
        }

        return obj;
    }

    getOriginalNetworkId() {
        return this.original_network_id;
    }

    getTransportStreamId() {
        return this.transport_stream_id;
    }

    getServiceIds() {
        if (this.service_ids === null) return null;

        return Array.from(this.service_ids.content);
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

    getScheduleAmount() {
        return this.epg.getScheduleAmount();
    }

    getTime() {
        if (this.time === null) return null;

        return new Date(this.time.getTime());
    }

    getLogoId(onid, tsid, sid) {
        if (!checkNestedObject(this.logo_id_refs, [onid, tsid, sid])) return null;

        let logo_id_ref = getNestedObject(this.logo_id_refs, [onid, tsid, sid]);

        return logo_id_ref.logo_id;
    }

    getLogo(logo_id, onid) {
        if (!checkNestedObject(this.logo_ids, [onid, logo_id])) return null;

        let logos = getNestedObject(this.logo_ids, [onid, logo_id]);

        let obj = {};

        for (let logo of logos.content) {
            obj[logo[0]] = logo[1];
        }

        return obj;
    }
}

module.exports = TsUtil;
