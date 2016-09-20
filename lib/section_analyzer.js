"use strict";

const TsChar = require("./char");
const TsDate = require("./date");
const TsUtil = require("./util");
const TsBase = require("./base");

class TsSectionAnalyzer extends TsBase {
    constructor() {
        super();

        this._versions = {};

        this._patFlag = false;
        this._nitFlag = false;
        this._sdtFlag = false;
        this._tdtFlag = false;
        this._totFlag = false;

        this._programNumbers = [];

        this._originalNetworkId = -1;
        this._transportStreamId = -1;
        this._serviceIds = [];

        this._network = null;
        this._services = {};

        this._time = null;
    }

    _process(tsSection, callback) {
        const tableId = tsSection.getTableId();

        if (tableId === 0x00) {
            // Program association
            this.onPat(tsSection);
        } else if (tableId === 0x40 || tableId === 0x41) {
            // Network information
            this.onNit(tsSection);
        } else if (tableId === 0x42 || tableId === 0x46) {
            // Service description
            this.onSdt(tsSection);
        } else if (tableId === 0x70) {
            // Time and date
            this.onTdt(tsSection);
        } else if (tableId === 0x73) {
            // Time offset
            this.onTot(tsSection);
        }

        this.push(tsSection);

        callback();
    }

    onPat(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();
        const subTable = TsUtil.getNestedObject(this._versions, [tableId, tsSection.getTransportStreamId()]);
        const isUpdated = TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        if (isUpdated) {
            // Reset pat flag
            this._patFlag = false;

            // Reset program numbers
            this._programNumbers = [];
        }

        const objSection = tsSection.decode();

        for (let i = 0, l = objSection.programs.length; i < l; i++) {
            const program = objSection.programs[i];

            if (program.program_number === 0) continue;

            // Add program number
            this._programNumbers.push(program.program_number);
        }

        if (TsUtil.checkSections(subTable)) {
            // Set pat flag
            this._patFlag = true;

            // Emit "programNumbers"
            this.emit("programNumbers", this._programNumbers);
        }
    }

    onNit(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();

        // Select actual network
        if (tableId !== 0x40) return;

        const subTable = TsUtil.getNestedObject(this._versions, [tableId, tsSection.getNetworkId()]);
        const isUpdated = TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        if (isUpdated) {
            // Reset nit flag
            this._nitFlag = false;

            // Reset network
            this._network = {};
        }

        const objSection = tsSection.decode();
        const tsDescriptors = objSection.network_descriptors.decode();

        for (let i = 0, l = tsDescriptors.length; i < l; i++) {
            const tsDescriptor = tsDescriptors[i];

            switch (tsDescriptor.getDescriptorTag()) {
                case 0x40: {
                    // Network name
                    const objDescriptor = tsDescriptor.decode();

                    this._network.networkName = new TsChar(objDescriptor.network_name).decode();

                    break;
                }
            }
        }

        if (TsUtil.checkSections(subTable)) {
            // Set nit flag
            this._nitFlag = true;

            // Emit "network"
            this.emit("network", this._network);
        }
    }

    onSdt(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();

        // Select actual stream
        if (tableId !== 0x42) return;

        const subTable = TsUtil.getNestedObject(this._versions, [tableId, tsSection.getOriginalNetworkId(), tsSection.getTransportStreamId()]);
        const isUpdated = TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        if (isUpdated) {
            // Reset sdt flag
            this._sdtFlag = false;

            // Reset service ids
            this._serviceIds = [];

            // Reset services
            this._services = {};
        }

        const objSection = tsSection.decode();

        // Set original network id
        this._originalNetworkId = objSection.original_network_id;

        // Set transport stream id
        this._transportStreamId = objSection.transport_stream_id;

        for (let i = 0, l = objSection.services.length; i < l; i++) {
            const service = objSection.services[i];
            const tsDescriptors = service.descriptors.decode();
            const _service = TsUtil.getNestedObject(this._services, [service.service_id]);

            // Add service id
            this._serviceIds.push(service.service_id);

            for (let j = 0, l2 = tsDescriptors.length; j < l2; j++) {
                const tsDescriptor = tsDescriptors[j];

                switch (tsDescriptor.getDescriptorTag()) {
                    case 0x48: {
                        // Service
                        const objDescriptor = tsDescriptor.decode();

                        _service.serviceType = objDescriptor.service_type;
                        _service.serviceProviderName = new TsChar(objDescriptor.service_provider_name).decode();
                        _service.serviceName = new TsChar(objDescriptor.service_name).decode();

                        break;
                    }
                }
            }

        }

        if (TsUtil.checkSections(subTable)) {
            // Set sdt flag
            this._sdtFlag = true;

            // Emit "originalNetworkId" & "transportStreamId" & "serviceIds"
            this.emit("originalNetworkId", this._originalNetworkId);
            this.emit("transportStreamId", this._transportStreamId);
            this.emit("serviceIds", this._serviceIds);

            // Emit "services"
            this.emit("services", this._services);
        }
    }

    onTdt(tsSection) {
        const objSection = tsSection.decode();

        // Set time
        this._time = new TsDate(objSection.JST_time).decode();

        // Set tdt flag
        this._tdtFlag = true;

        // Emit "time"
        this.emit("time", this._time);
    }

    onTot(tsSection) {
        const objSection = tsSection.decode();

        // Set time
        this._time = new TsDate(objSection.JST_time).decode();

        // Set tot flag
        this._totFlag = true;

        // Emit "time"
        this.emit("time", this._time);
    }

    reset() {
        this._patFlag = false;
        this._sdtFlag = false;
        this._tdtFlag = false;
        this._totFlag = false;

        this._programNumbers = [];
        this._originalNetworkId = -1;
        this._transportStreamId = -1;
        this._serviceIds = [];
        this._time = null;
    }

    hasProgramNumbers() {
        return this._patFlag;
    }

    hasOriginalNetworkId() {
        return this._sdtFlag;
    }

    hasTransportStreamId() {
        return this._sdtFlag;
    }

    hasServiceIds() {
        return this._sdtFlag;
    }

    hasNetwork() {
        return this._nitFlag;
    }

    hasServices() {
        return this._sdtFlag;
    }

    hasTime() {
        return this._tdtFlag || this.totFlag;
    }

    getProgramNumbers() {
        return this._programNumbers.slice();
    }

    getOriginalNetworkId() {
        return this._originalNetworkId;
    }

    getTransportStreamId() {
        return this._transportStreamId;
    }

    getServiceIds() {
        return this._serviceIds.slice();
    }

    getNetwork() {
        return this._network;
    }

    getServices() {
        return this._services;
    }

    getTime() {
        return this._time;
    }
}

module.exports = TsSectionAnalyzer;
