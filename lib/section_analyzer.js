"use strict";

const TsChar = require("./char");
const TsDate = require("./date");
const TsUtil = require("./util");
const TsBase = require("./base");

class TsSectionAnalyzer extends TsBase {
    constructor() {
        super();

        this.versions = {};

        this.patFlag = false;
        this.nitFlag = false;
        this.sdtFlag = false;
        this.tdtFlag = false;
        this.totFlag = false;

        this.programNumbers = [];

        this.originalNetworkId = -1;
        this.transportStreamId = -1;
        this.serviceIds = [];

        this.network = null;
        this.services = {};

        this.time = null;
    }

    _process(tsSection) {
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
    }

    onPat(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();
        const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getTransportStreamId()]);
        const isUpdated = TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        if (isUpdated) {
            // Reset pat flag
            this.patFlag = false;

            // Reset program numbers
            this.programNumbers = [];
        }

        const objSection = tsSection.decode();

        for (let i = 0, l = objSection.programs.length; i < l; i++) {
            const program = objSection.programs[i];

            if (program.program_number === 0) continue;

            // Add program number
            this.programNumbers.push(program.program_number);
        }

        if (TsUtil.checkSections(subTable)) {
            // Set pat flag
            this.patFlag = true;

            // Emit "programNumbers"
            this.emit("programNumbers", this.programNumbers);
        }
    }

    onNit(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();

        // Select actual network
        if (tableId !== 0x40) return;

        const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getNetworkId()]);
        const isUpdated = TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        if (isUpdated) {
            // Reset nit flag
            this.nitFlag = false;

            // Reset network
            this.network = {};
        }

        const objSection = tsSection.decode();
        const tsDescriptors = objSection.network_descriptors.decode();

        for (let i = 0, l = tsDescriptors.length; i < l; i++) {
            const tsDescriptor = tsDescriptors[i];

            switch (tsDescriptor.getDescriptorTag()) {
                case 0x40: {
                    // Network name
                    const objDescriptor = tsDescriptor.decode();

                    this.network.networkName = new TsChar(objDescriptor.network_name).decode();

                    break;
                }
            }
        }

        if (TsUtil.checkSections(subTable)) {
            // Set nit flag
            this.nitFlag = true;

            // Emit "network"
            this.emit("network", this.network);
        }
    }

    onSdt(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();

        // Select actual stream
        if (tableId !== 0x42) return;

        const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getOriginalNetworkId(), tsSection.getTransportStreamId()]);
        const isUpdated = TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        if (isUpdated) {
            // Reset sdt flag
            this.sdtFlag = false;

            // Reset service ids
            this.serviceIds = [];

            // Reset services
            this.services = {};
        }

        const objSection = tsSection.decode();

        // Set original network id
        this.originalNetworkId = objSection.original_network_id;

        // Set transport stream id
        this.transportStreamId = objSection.transport_stream_id;

        for (let i = 0, l = objSection.services.length; i < l; i++) {
            const service = objSection.services[i];
            const tsDescriptors = service.descriptors.decode();
            const _service = TsUtil.getNestedObject(this.services, [service.service_id]);

            // Add service id
            this.serviceIds.push(service.service_id);

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
            this.sdtFlag = true;

            // Emit "originalNetworkId" & "transportStreamId" & "serviceIds"
            this.emit("originalNetworkId", this.originalNetworkId);
            this.emit("transportStreamId", this.transportStreamId);
            this.emit("serviceIds", this.serviceIds);

            // Emit "services"
            this.emit("services", this.services);
        }
    }

    onTdt(tsSection) {
        const objSection = tsSection.decode();

        // Set time
        this.time = new TsDate(objSection.JST_time).decode();

        // Set tdt flag
        this.tdtFlag = true;

        // Emit "time"
        this.emit("time", this.time);
    }

    onTot(tsSection) {
        const objSection = tsSection.decode();

        // Set time
        this.time = new TsDate(objSection.JST_time).decode();

        // Set tot flag
        this.totFlag = true;

        // Emit "time"
        this.emit("time", this.time);
    }

    reset() {
        this.patFlag = false;
        this.sdtFlag = false;
        this.tdtFlag = false;
        this.totFlag = false;

        this.programNumbers = [];
        this.originalNetworkId = -1;
        this.transportStreamId = -1;
        this.serviceIds = [];
        this.time = null;
    }

    hasProgramNumbers() {
        return this.patFlag;
    }

    hasOriginalNetworkId() {
        return this.sdtFlag;
    }

    hasTransportStreamId() {
        return this.sdtFlag;
    }

    hasServiceIds() {
        return this.sdtFlag;
    }

    hasNetwork() {
        return this.nitFlag;
    }

    hasServices() {
        return this.sdtFlag;
    }

    hasTime() {
        return this.tdtFlag || this.totFlag;
    }

    getProgramNumbers() {
        return this.programNumbers.slice();
    }

    getOriginalNetworkId() {
        return this.originalNetworkId;
    }

    getTransportStreamId() {
        return this.transportStreamId;
    }

    getServiceIds() {
        return this.serviceIds.slice();
    }

    getNetwork() {
        return this.network;
    }

    getServices() {
        return this.services;
    }

    getTime() {
        return this.time;
    }
}

module.exports = TsSectionAnalyzer;
