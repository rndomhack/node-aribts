"use strict";

const TsBase = require("./base");
const TsUtil = require("./util");

class TsSectionUpdater extends TsBase {
    constructor() {
        super();

        this.versions = {};
    }

    _process(tsSection, callback) {
        const tableId = tsSection.getTableId();

        if (tableId === 0x00) {
            // Program association
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getTransportStreamId()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("pat", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x01) {
            // Conditional access
            const subTable = TsUtil.getNestedObject(this.versions, [tableId]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("cat", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x02) {
            // Program map
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getProgramNumber()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("pmt", tsSection);

            this.push(tsSection);
        } else if (tableId >= 0x3A && tableId <= 0x3F) {
            // DSM-CC
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getTableIdExtension()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("dsmcc", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x40 || tableId === 0x41) {
            // Network information
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getNetworkId()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("nit", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x42 || tableId === 0x46) {
            // Service description
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getOriginalNetworkId(), tsSection.getTransportStreamId()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("sdt", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x4A) {
            // Bouquet association
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getBouquetId()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("bat", tsSection);

            this.push(tsSection);
        } else if (tableId >= 0x4E && tableId <= 0x6F) {
            // Event information
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getOriginalNetworkId(), tsSection.getTransportStreamId(), tsSection.getServiceId()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("eit", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x70) {
            // Time and date
            this.emit("tdt", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x73) {
            // Time offset
            this.emit("tot", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x7E) {
            // Discontinuity information
            this.emit("dit", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x7F) {
            // Selection information
            const subTable = TsUtil.getNestedObject(this.versions, [tableId]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("sit", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x82) {
            // ECM
            this.emit("ecm", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x84) {
            // EMM
            this.emit("emm", tsSection);

            this.push(tsSection);
        } else if (tableId === 0x85) {
            // EMM message
            this.emit("emmm", tsSection);

            this.push(tsSection);
        } else if (tableId === 0xC3) {
            // Software download trigger
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getTableIdExtension()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("sdtt", tsSection);

            this.push(tsSection);
        } else if (tableId === 0xC8) {
            // Common data
            const subTable = TsUtil.getNestedObject(this.versions, [tableId, tsSection.getDownloadDataId()]);

            TsUtil.updateSubTable(subTable, tsSection);

            if (!TsUtil.updateSection(subTable, tsSection)) {
                callback();
                return;
            }

            this.emit("cdt", tsSection);

            this.push(tsSection);
        }

        callback();
    }

    reset() {
        this.versions = {};
    }
}

module.exports = TsSectionUpdater;
