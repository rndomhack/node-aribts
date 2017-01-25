"use strict";

const TsChar = require("./char");
const TsLogo = require("./logo");
const TsUtil = require("./util");
const TsBase = require("./base");
const tsDataModuleList = require("./data_module");

class TsCommonDataManager extends TsBase {
    constructor() {
        super();

        this._versions = {};

        this._downloadDataIds = {};
        this._downloadIds = {};

        this._genres = {};
        this._features = {};
        this._keywords = {};

        this._logos = {};
        this._logoRefs = {};
        this._simpleLogos = {};
    }

    _process(tsSection, callback) {
        const tableId = tsSection.getTableId();

        if (tableId >= 0x3A && tableId <= 0x3F) {
            // DSM-CC
            this.onDsmcc(tsSection);
        } else if (tableId === 0x42 || tableId === 0x46) {
            // Service description
            this.onSdt(tsSection);
        } else if (tableId === 0xC3) {
            // Software download trigger
            this.onSdtt(tsSection);
        } else if (tableId === 0xC8) {
            // Common data
            this.onCdt(tsSection);
        }

        callback();
    }

    onDsmcc(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();
        const subTable = TsUtil.getNestedObject(this._versions, [tableId, tsSection.getTableIdExtension()]);

        TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        switch (tableId) {
            case 0x3B: {
                // DII
                const objSection = tsSection.decode();
                const objMessage = objSection.userNetworkMessage.decode();

                // Check download id
                if (!TsUtil.checkNestedObject(this._downloadIds, [objMessage.downloadId])) break;

                // Get download id
                const downloadId = TsUtil.getNestedObject(this._downloadIds, [objMessage.downloadId]);

                const objCompatibilityDescriptor = objMessage.compatibilityDescriptor.decode();

                downloadId.compatibilities = [];
                downloadId.numberOfModules = objMessage.numberOfModules;
                downloadId.modules = {};
                downloadId.completeModules = [];

                for (let i = 0, l = objCompatibilityDescriptor.descriptors.length; i < l; i++) {
                    const descriptor = objCompatibilityDescriptor.descriptors[i];

                    downloadId.compatibilities.push({
                        model: descriptor.model,
                        version: descriptor.version
                    });
                }

                for (let i = 0, l = objMessage.modules.length; i < l; i++) {
                    const diiModule = objMessage.modules[i];
                    const module = TsUtil.getNestedObject(downloadId.modules, [diiModule.moduleId]);

                    module.moduleSize = diiModule.moduleSize;
                    module.moduleVersion = diiModule.moduleVersion;
                    module.moduleName = null;
                    module.numberOfBlocks = Math.ceil(diiModule.moduleSize / objMessage.blockSize);
                    module.blocks = [];
                    module.blockCount = 0;
                    module.moduleDataByte = null;

                    const tsCarouselDescriptors = diiModule.moduleInfo.decode();

                    for (let j = 0, l2 = tsCarouselDescriptors.length; j < l2; j++) {
                        const tsCarouselDescriptor = tsCarouselDescriptors[j];

                        switch (tsCarouselDescriptor.getDescriptorTag()) {
                            case 0x02: {
                                // Name
                                const objDescriptor = tsCarouselDescriptor.decode();

                                module.moduleName = objDescriptor.text.toString("utf8");

                                break;
                            }
                        }
                    }
                }

                break;
            }

            case 0x3C: {
                // DDB
                const objSection = tsSection.decode();
                const objMessage = objSection.downloadDataMessage.decode();

                // Check download id
                if (!TsUtil.checkNestedObject(this._downloadIds, [objMessage.downloadId])) return;

                // Get download id
                const downloadId = TsUtil.getNestedObject(this._downloadIds, [objMessage.downloadId]);

                if (Object.keys(downloadId).length === 0) break;
                if (downloadId.completeModules.includes(objMessage.moduleId)) break;

                // Check module
                if (!TsUtil.checkNestedObject(downloadId.modules, [objMessage.moduleId])) break;

                // Get module
                const module = TsUtil.getNestedObject(downloadId.modules, [objMessage.moduleId]);

                if (objMessage.moduleVersion !== module.moduleVersion) break;
                if (module.blocks.hasOwnProperty(objMessage.blockNumber)) break;

                module.blocks[objMessage.blockNumber] = objMessage.blockDataByte;
                module.blockCount++;

                if (module.blockCount === module.numberOfBlocks) {
                    const moduleDataByte = Buffer.concat(module.blocks);

                    if (moduleDataByte.length === module.moduleSize) {
                        module.moduleDataByte = moduleDataByte;
                        downloadId.completeModules.push(objMessage.moduleId);
                    }

                    module.blocks = [];
                    module.blockCount = 0;
                }

                if (downloadId.completeModules.length === downloadId.numberOfModules) {
                    for (let keys = Object.keys(downloadId.modules), i = 0, l = keys.length; i < l; i++) {
                        const _module = downloadId.modules[keys[i]];

                        switch (_module.moduleName) {
                            case "GENRE":
                            case "CS_GENRE": {
                                // Genre
                                const objDataModule = new tsDataModuleList.TsDataModuleCommonTable(_module.moduleDataByte).decode();

                                const genre = [];

                                for (let j = 0, l2 = objDataModule.common_tables.length; j < l2; j++) {
                                    const table = objDataModule.common_tables[j];

                                    genre.push({
                                        level1: new TsChar(table.level_1_name).decode(),
                                        level2: new TsChar(table.level_2_name).decode()
                                    });
                                }

                                for (let j = 0, l2 = downloadId.compatibilities.length; j < l2; j++) {
                                    const compatibility = downloadId.compatibilities[j];

                                    switch (compatibility.model) {
                                        case 0xFFFA: {
                                            this._genres.terrestrial = genre;

                                            this.emit("genre", genre, "terrestrial");

                                            break;
                                        }

                                        case 0xFFFC: {
                                            this._genres.cs = genre;

                                            this.emit("genre", genre, "cs");

                                            break;
                                        }

                                        case 0xFFFE: {
                                            this._genres.bs = genre;

                                            this.emit("genre", genre, "bs");

                                            break;
                                        }
                                    }
                                }

                                break;
                            }

                            case "FEATURE":
                            case "CS_FEATURE": {
                                // Feature
                                const objDataModule = new tsDataModuleList.TsDataModuleCommonTable(_module.moduleDataByte).decode();

                                const feature = [];

                                for (let j = 0, l2 = objDataModule.common_tables.length; j < l2; j++) {
                                    const table = objDataModule.common_tables[j];

                                    feature.push({
                                        level1: new TsChar(table.level_1_name).decode(),
                                        level2: new TsChar(table.level_2_name).decode()
                                    });
                                }

                                for (let j = 0, l2 = downloadId.compatibilities.length; j < l2; j++) {
                                    const compatibility = downloadId.compatibilities[j];

                                    switch (compatibility.model) {
                                        case 0xFFFA: {
                                            this._features.terrestrial = feature;

                                            this.emit("feature", feature, "terrestrial");

                                            break;
                                        }

                                        case 0xFFFC: {
                                            this._features.cs = feature;

                                            this.emit("feature", feature, "cs");

                                            break;
                                        }

                                        case 0xFFFE: {
                                            this._features.bs = feature;

                                            this.emit("feature", feature, "bs");

                                            break;
                                        }
                                    }
                                }

                                break;
                            }

                            case "KEYWORD":
                            case "CS_KEYWORD": {
                                // Keyword
                                const objDataModule = new tsDataModuleList.TsDataModuleKeywordTable(_module.moduleDataByte).decode();

                                const keyword = [];

                                for (let j = 0, l2 = objDataModule.keyword_tables.length; j < l2; j++) {
                                    const table = objDataModule.keyword_tables[j];

                                    keyword.push(new TsChar(table.name).decode());
                                }

                                for (let j = 0, l2 = downloadId.compatibilities.length; j < l2; j++) {
                                    const compatibility = downloadId.compatibilities[j];

                                    switch (compatibility.model) {
                                        case 0xFFFA: {
                                            this._keywords.terrestrial = keyword;

                                            this.emit("keyword", keyword, "terrestrial");

                                            break;
                                        }

                                        case 0xFFFC: {
                                            this._keywords.cs = keyword;

                                            this.emit("keyword", keyword, "cs");

                                            break;
                                        }

                                        case 0xFFFE: {
                                            this._keywords.bs = keyword;

                                            this.emit("keyword", keyword, "bs");

                                            break;
                                        }
                                    }
                                }

                                break;
                            }

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
                                const objDataModule = new tsDataModuleList.TsDataModuleLogo(_module.moduleDataByte).decode();

                                for (let j = 0, l2 = objDataModule.logos.length; j < l2; j++) {
                                    const moduleLogo = objDataModule.logos[j];
                                    const logoData = new TsLogo(moduleLogo.data).decode();

                                    const originalNetworkIds = [];

                                    for (let k = 0, l3 = moduleLogo.services.length; k < l3; k++) {
                                        const service = moduleLogo.services[k];

                                        if (!originalNetworkIds.includes(service.original_network_id)) {
                                            originalNetworkIds.push(service.original_network_id);
                                        }

                                        const logoRef = TsUtil.getNestedObject(this._logoRefs, [service.original_network_id, service.transport_stream_id, service.service_id]);

                                        logoRef.logoId = moduleLogo.logo_id;
                                    }

                                    for (let k = 0, l3 = originalNetworkIds.length; k < l3; k++) {
                                        const originalNetworkId = originalNetworkIds[k];

                                        const logo = TsUtil.getNestedObject(this._logos, [originalNetworkId, moduleLogo.logo_id]);

                                        if (Object.keys(logo).length === 0 || _module.moduleVersion !== logo.version) {
                                            logo.types = [];
                                            logo.completeTypes = [];
                                            logo.version = _module.moduleVersion;
                                        }

                                        if (logo.completeTypes.includes(objDataModule.logo_type)) continue;

                                        logo.types[objDataModule.logo_type] = logoData;
                                        logo.completeTypes.push(objDataModule.logo_type);

                                        this.emit("logo", logo.types[objDataModule.logo_type], originalNetworkId, moduleLogo.logo_id, objDataModule.logo_type);

                                        if (logo.completeTypes.length === 6) {
                                            this.emit("logos", logo.types, originalNetworkId, moduleLogo.logo_id);
                                        }
                                    }
                                }

                                break;
                            }
                        }
                    }

                    TsUtil.removeNestedObject(this._downloadIds, [objMessage.downloadId]);
                }

                break;
            }
        }
    }

    onSdt(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();
        const subTable = TsUtil.getNestedObject(this._versions, [tableId, tsSection.getOriginalNetworkId(), tsSection.getTransportStreamId()]);

        TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        const objSection = tsSection.decode();

        for (let i = 0, l = objSection.services.length; i < l; i++) {
            const service = objSection.services[i];
            const tsDescriptors = service.descriptors.decode();

            for (let j = 0, l2 = tsDescriptors.length; j < l2; j++) {
                const tsDescriptor = tsDescriptors[j];

                switch (tsDescriptor.getDescriptorTag()) {
                    case 0xCF: {
                        // Logo transmission
                        const objDescriptor = tsDescriptor.decode();

                        switch (objDescriptor.logo_transmission_type) {
                            case 1: {
                                const logoRef = TsUtil.getNestedObject(this._logoRefs, [objSection.original_network_id, objSection.transport_stream_id, service.service_id]);

                                logoRef.logoId = objDescriptor.logo_id;

                                TsUtil.getNestedObject(this._downloadDataIds, [objSection.original_network_id, objDescriptor.download_data_id]);

                                break;
                            }

                            case 2: {
                                const logoRef = TsUtil.getNestedObject(this._logoRefs, [objSection.original_network_id, objSection.transport_stream_id, service.service_id]);

                                logoRef.logoId = objDescriptor.logo_id;

                                break;
                            }

                            case 3: {
                                const simpleLogo = TsUtil.getNestedObject(this._simpleLogos, [objSection.original_network_id, objSection.transport_stream_id, service.service_id]);

                                simpleLogo.logo = new TsChar(objDescriptor.logo).decode();

                                this.emit("simpleLogo", simpleLogo.logo, objSection.original_network_id, objSection.transport_stream_id, service.service_id);

                                break;
                            }
                        }

                        break;
                    }
                }
            }
        }
    }

    onSdtt(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        // Select common data
        if (tsSection.getTableIdExtension() >> 8 !== 0xFF) return;

        const tableId = tsSection.getTableId();
        const subTable = TsUtil.getNestedObject(this._versions, [tableId, tsSection.getTableIdExtension()]);

        TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        const objSection = tsSection.decode();

        for (let i = 0, l = objSection.contents.length; i < l; i++) {
            const contents = objSection.contents[i];
            const tsDescriptors = contents.descriptors.decode();

            for (let j = 0, l2 = tsDescriptors.length; j < l2; j++) {
                const tsDescriptor = tsDescriptors[j];

                switch (tsDescriptor.getDescriptorTag()) {
                    case 0xC9: {
                        // Download content
                        const objDescriptor = tsDescriptor.decode();

                        TsUtil.getNestedObject(this._downloadIds, [objDescriptor.download_id]);
                    }
                }
            }
        }
    }

    onCdt(tsSection) {
        // Select current sub table
        if (tsSection.getCurrentNextIndicator() === 0) return;

        const tableId = tsSection.getTableId();
        const subTable = TsUtil.getNestedObject(this._versions, [tableId, tsSection.getOriginalNetworkId(), tsSection.getDownloadDataId()]);

        TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        // Check download data id
        if (!TsUtil.checkNestedObject(this._downloadDataIds, [tsSection.getOriginalNetworkId(), tsSection.getDownloadDataId()])) return;

        const objSection = tsSection.decode();

        switch (objSection.data_type) {
            case 0x01: {
                // Logo
                const objDataModule = new tsDataModuleList.TsDataModuleCdtLogo(objSection.data_module).decode();

                const logo = TsUtil.getNestedObject(this._logos, [objSection.original_network_id, objDataModule.logo_id]);

                if (Object.keys(logo).length === 0 || objDataModule.logo_version !== logo.version) {
                    logo.types = [];
                    logo.completeTypes = [];
                    logo.version = objDataModule.logo_version;
                }

                if (logo.completeTypes.includes(objDataModule.logo_type)) break;

                logo.types[objDataModule.logo_type] = objDataModule.data;
                logo.completeTypes.push(objDataModule.logo_type);

                this.emit("logo", logo.types[objDataModule.logo_type], objSection.original_network_id, objDataModule.logo_id, objDataModule.logo_type);

                if (logo.completeTypes.length === 6) {
                    this.emit("logos", logo.types, objSection.original_network_id, objDataModule.logo_id);
                }

                break;
            }
        }

        if (TsUtil.checkSections(subTable)) {
            TsUtil.removeNestedObject(this._downloadDataIds, [objSection.original_network_id, objSection.download_data_id]);
        }
    }

    hasGenre(type) {
        return this._genres.hasOwnProperty(type);
    }

    hasFeature(type) {
        return this._features.hasOwnProperty(type);
    }

    hasKeyword(type) {
        return this._keywords.hasOwnProperty(type);
    }

    hasLogos(onid, logoId) {
        if (!TsUtil.checkNestedObject(this._logos, [onid, logoId])) return false;

        const logo = TsUtil.getNestedObject(this._logos, [onid, logoId]);

        return logo.completeTypes.length === 6;
    }

    hasLogo(onid, logoId, logoType) {
        if (!TsUtil.checkNestedObject(this._logos, [onid, logoId])) return false;

        const logo = TsUtil.getNestedObject(this._logos, [onid, logoId]);

        return logo.types.hasOwnProperty(logoType);
    }

    hasSimpleLogo(onid, tsid, sid) {
        return TsUtil.checkNestedObject(this._simpleLogos, [onid, tsid, sid]);
    }

    getGenres() {
        return this._genres;
    }

    getGenre(type) {
        if (!this.hasGenre(type)) return null;

        return this._genres[type];
    }

    getFeatures() {
        return this._features;
    }

    getFeature(type) {
        if (!this.hasFeature(type)) return null;

        return this._features[type];
    }

    getKeywords() {
        return this._keywords;
    }

    getKeyword(type) {
        if (!this.hasKeyword(type)) return null;

        return this._keywords[type];
    }

    hasLogos(onid, logoId) {
        if (!TsUtil.checkNestedObject(this._logos, [onid, logoId])) return null;

        const logo = TsUtil.getNestedObject(this._logos, [onid, logoId]);

        return logo.types;
    }

    hasLogo(onid, logoId, logoType) {
        if (!TsUtil.checkNestedObject(this._logos, [onid, logoId])) return null;

        const logo = TsUtil.getNestedObject(this._logos, [onid, logoId]);

        if (!logo.types.hasOwnProperty(logoType)) return null;

        return logo.types[logoType];
    }

    hasSimpleLogo(onid, tsid, sid) {
        if (TsUtil.checkNestedObject(this._simpleLogos, [onid, tsid, sid])) return null;

        const simpleLogo = TsUtil.getNestedObject(this._simpleLogos, [onid, tsid, sid]);

        return simpleLogo.logo;
    }
}

module.exports = TsCommonDataManager;
