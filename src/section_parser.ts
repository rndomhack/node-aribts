import TsBase from "./base";
import TsBuffer from "./buffer";
import TsPacket from "./packet";
import * as sectionIndex from "./section/index";

export type Section = (
    sectionIndex.TsSectionBase |
    sectionIndex.TsSectionProgramAssociation |
    sectionIndex.TsSectionConditionalAccess |
    sectionIndex.TsSectionProgramMap |
    sectionIndex.TsSectionDsmcc |
    sectionIndex.TsSectionNetworkInformation |
    sectionIndex.TsSectionServiceDescription |
    sectionIndex.TsSectionBouquetAssociation |
    sectionIndex.TsSectionEventInformation |
    sectionIndex.TsSectionTimeAndDate |
    sectionIndex.TsSectionTimeOffset |
    sectionIndex.TsSectionDiscontinuityInformation |
    sectionIndex.TsSectionSelectionInformation |
    sectionIndex.TsSectionEcm |
    sectionIndex.TsSectionEmm |
    sectionIndex.TsSectionEmmMessage |
    sectionIndex.TsSectionSoftwareDownloadTrigger |
    sectionIndex.TsSectionCommonData
);

export interface Info {
    [pid: number]: {
        counter: number;
        duplication: number;
        buffer: TsBuffer;
        entireLength: number;
    };
}

export interface SectionParserEvents {
    on(event: "data", fn: (section: Section) => void): void;
    on(event: "pat", fn: (section: sectionIndex.TsSectionProgramAssociation) => void): void;
    on(event: "cat", fn: (section: sectionIndex.TsSectionConditionalAccess) => void): void;
    on(event: "pmt", fn: (section: sectionIndex.TsSectionProgramMap) => void): void;
    on(event: "dsmcc", fn: (section: sectionIndex.TsSectionDsmcc) => void): void;
    on(event: "nit", fn: (section: sectionIndex.TsSectionNetworkInformation) => void): void;
    on(event: "sdt", fn: (section: sectionIndex.TsSectionServiceDescription) => void): void;
    on(event: "bat", fn: (section: sectionIndex.TsSectionBouquetAssociation) => void): void;
    on(event: "eit", fn: (section: sectionIndex.TsSectionEventInformation) => void): void;
    on(event: "tdt", fn: (section: sectionIndex.TsSectionTimeAndDate) => void): void;
    on(event: "tot", fn: (section: sectionIndex.TsSectionTimeOffset) => void): void;
    on(event: "dit", fn: (section: sectionIndex.TsSectionDiscontinuityInformation) => void): void;
    on(event: "sit", fn: (section: sectionIndex.TsSectionSelectionInformation) => void): void;
    on(event: "ecm", fn: (section: sectionIndex.TsSectionEcm) => void): void;
    on(event: "emm", fn: (section: sectionIndex.TsSectionEmm) => void): void;
    on(event: "emmm", fn: (section: sectionIndex.TsSectionEmmMessage) => void): void;
    on(event: "sdtt", fn: (section: sectionIndex.TsSectionSoftwareDownloadTrigger) => void): void;
    on(event: "cdt", fn: (section: sectionIndex.TsSectionCommonData) => void): void;
}

export default class TsSectionParser extends TsBase implements SectionParserEvents {
    _info: Info;

    constructor() {
        super();

        this._info = {};
    }

    _process(tsPacket: TsPacket, callback: Function) {
        // Check transport_error_indicator
        if (tsPacket.getTransportErrorIndicator() === 1) {
            callback();
            return;
        }

        // Check scramble
        if (tsPacket.getTransportScramblingControl() >> 1 === 1) {
            callback();
            return;
        }

        // Check data
        if (!tsPacket.hasData()) {
            callback();
            return;
        }

        // Get pid
        const pid = tsPacket.getPid();

        // Get payload unit start indicator
        const payloadUnitStartIndicator = tsPacket.getPayloadUnitStartIndicator();

        // Add info
        if (!this._info.hasOwnProperty(pid)) {
            this._info[pid] = {
                counter: -1,
                duplication: 0,
                buffer: new TsBuffer(),
                entireLength: 0
            };
        }

        // Get info
        const info = this._info[pid];

        // Check payload unit start indicator
        if (payloadUnitStartIndicator === 1) {
            if (tsPacket.isPes()) {
                callback();
                return;
            }
        } else {
            if (info.entireLength === 0) {
                callback();
                return;
            }
        }

        // Get counter
        const counter = tsPacket.getContinuityCounter();

        // Check discontinuity_indicator
        if (tsPacket.hasAdaptationField() &&
            tsPacket.getAdaptationFieldLength() > 0 &&
            tsPacket.getDiscontinuityIndicator() === 1) {
            // Reset counter
            info.counter = -1;
        }

        // Check drop
        if (info.counter !== -1 && pid !== 0x1FFF) {
            const previous = info.counter;
            const expected = (previous + 1) & 0x0F;
            let drop = false;

            // Set counter
            info.counter = counter;

            if (counter === previous) {
                // Increment duplication
                info.duplication++;

                if (info.duplication === 1) {
                    callback();
                    return;
                }

                if (info.duplication > 1) {
                    drop = true;
                }
            } else {
                // Reset duplication
                info.duplication = 0;

                if (counter !== expected) {
                    drop = true;
                }
            }

            if (drop) {
                // Clear chunk
                info.buffer.clear();
                info.entireLength = 0;

                callback();
                return;
            }
        } else {
            // Set counter
            info.counter = counter;
        }

        const sections: Buffer[] = [];

        // Is first packet
        if (payloadUnitStartIndicator === 1) {
            const data = tsPacket.getData();
            let bytesRead = 0;

            const pointerField = data[0];
            bytesRead++;

            if (pointerField !== 0 && info.buffer.length !== 0) {
                // Multi section
                if (info.entireLength - info.buffer.length === pointerField) {
                    // Add buffer
                    info.buffer.add(data.slice(bytesRead, bytesRead + pointerField));

                    // Add section
                    sections.push(info.buffer.concat());
                } else {
                    // Invalid data
                }
            }

            if (info.buffer.length !== 0) {
                // Clear chunk
                info.buffer.clear();
                info.entireLength = 0;
            }

            bytesRead += pointerField;

            while (data.length >= bytesRead + 3 && data[bytesRead] !== 0xFF) {
                const sectionLength = 3 + ((data[bytesRead + 1] & 0x0F) << 8 | data[bytesRead + 2]);

                if (data.length < bytesRead + sectionLength) {
                    // Add buffer
                    info.buffer.add(data.slice(bytesRead, data.length));
                    info.entireLength = sectionLength;
                    break;
                }

                // Add section
                sections.push(data.slice(bytesRead, bytesRead + sectionLength));

                bytesRead += sectionLength;
            }
        } else {
            // Continuing section
            const data = tsPacket.getData();
            const remainingLength = info.entireLength - info.buffer.length;

            if (data.length < remainingLength) {
                // Add buffer
                info.buffer.add(data);
            } else {
                // Add buffer
                info.buffer.add(data.slice(0, remainingLength));

                // Add section
                sections.push(info.buffer.concat());

                // Clear chunk
                info.buffer.clear();
                info.entireLength = 0;
            }
        }

        for (let i = 0, l = sections.length; i < l; i++) {
            const section = sections[i];
            const tableId = section[0];

            if (tableId === 0x00) {
                // Program association
                const tsSection = new sectionIndex.TsSectionProgramAssociation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("pat", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x01) {
                // Conditional access
                const tsSection = new sectionIndex.TsSectionConditionalAccess(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("cat", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x02) {
                // Program map
                const tsSection = new sectionIndex.TsSectionProgramMap(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("pmt", tsSection);

                this.push(tsSection);
            } else if (tableId >= 0x3A && tableId <= 0x3F) {
                // DSM-CC
                const tsSection = new sectionIndex.TsSectionDsmcc(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("dsmcc", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x40 || tableId === 0x41) {
                // Network information
                const tsSection = new sectionIndex.TsSectionNetworkInformation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("nit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x42 || tableId === 0x46) {
                // Service description
                const tsSection = new sectionIndex.TsSectionServiceDescription(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("sdt", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x4A) {
                // Bouquet association
                const tsSection = new sectionIndex.TsSectionBouquetAssociation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("bat", tsSection);

                this.push(tsSection);
            } else if (tableId >= 0x4E && tableId <= 0x6F) {
                // Event information
                const tsSection = new sectionIndex.TsSectionEventInformation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("eit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x70) {
                // Time and date
                const tsSection = new sectionIndex.TsSectionTimeAndDate(section, pid);

                this.emit("tdt", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x73) {
                // Time offset
                const tsSection = new sectionIndex.TsSectionTimeOffset(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("tot", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x7E) {
                // Discontinuity information
                const tsSection = new sectionIndex.TsSectionDiscontinuityInformation(section, pid);

                this.emit("dit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x7F) {
                // Selection information
                const tsSection = new sectionIndex.TsSectionSelectionInformation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("sit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x82) {
                // ECM
                const tsSection = new sectionIndex.TsSectionEcm(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("ecm", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x84) {
                // EMM
                const tsSection = new sectionIndex.TsSectionEmm(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("emm", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x85) {
                // EMM message
                const tsSection = new sectionIndex.TsSectionEmmMessage(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("emmm", tsSection);

                this.push(tsSection);
            } else if (tableId === 0xC3) {
                // Software download trigger
                const tsSection = new sectionIndex.TsSectionSoftwareDownloadTrigger(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("sdtt", tsSection);

                this.push(tsSection);
            } else if (tableId === 0xC8) {
                // Common data
                const tsSection = new sectionIndex.TsSectionCommonData(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("cdt", tsSection);

                this.push(tsSection);
            } else {
                // private section, pipe as TsSectionBase
                const tsSection = new sectionIndex.TsSectionBase(section, pid);

                this.push(tsSection);
            }
        }

        callback();
    }
}
