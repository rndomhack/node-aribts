"use strict";

const TsDate = require("./date");
const TsUtil = require("./util");
const TsBase = require("./base");

class TsSectionAnalyzer extends TsBase {
    constructor() {
        super();

        this.versions = {};

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

    process(tsSection) {
        const tableId = tsSection.getTableId();

        if (tableId === 0x00) {
            // Program association
            this.onPat(tsSection);
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
            this.programNumbers.length = 0;
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
            this.serviceIds.length = 0;
        }

        const objSection = tsSection.decode();

        // Set original network id
        this.originalNetworkId = objSection.original_network_id;

        // Set transport stream id
        this.transportStreamId = objSection.transport_stream_id;

        for (let i = 0, l = objSection.services.length; i < l; i++) {
            const service = objSection.services[i];

            if (service.program_number === 0) continue;

            // Add service id
            this.serviceIds.push(service.service_id);
        }

        if (TsUtil.checkSections(subTable)) {
            // Set sdt flag
            this.sdtFlag = true;

            // Emit "originalNetworkId" & "transportStreamId" & "serviceIds"
            this.emit("originalNetworkId", this.originalNetworkId);
            this.emit("transportStreamId", this.transportStreamId);
            this.emit("serviceIds", this.serviceIds);
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

        this.programNumbers.length = 0;
        this.originalNetworkId = -1;
        this.transportStreamId = -1;
        this.serviceIds.length = 0;
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

    getTime() {
        return this.time;
    }
}

module.exports = TsSectionAnalyzer;
