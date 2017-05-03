import TsBase from "./base";
import TsBuffer from "./buffer";
import TsPacket from "./packet";

import Base from "./section/base";
import ProgramAssociation from "./section/program_association";
import ConditionalAccess from "./section/conditional_access";
import ProgramMap from "./section/program_map";
import Dsmcc from "./section/dsmcc";
import NetworkInformation from "./section/network_information";
import ServiceDescription from "./section/service_description";
import BouquetAssociation from "./section/bouquet_association";
import EventInformation from "./section/event_information";
import TimeAndDate from "./section/time_and_date";
import TimeOffset from "./section/time_offset";
import DiscontinuityInformation from "./section/discontinuity_information";
import SelectionInformation from "./section/selection_information";
import Ecm from "./section/ecm";
import Emm from "./section/emm";
import EmmMessage from "./section/emm_message";
import SoftwareDownloadTrigger from "./section/software_download_trigger";
import CommonData from "./section/common_data";

export type Section = (
    Base |
    ProgramAssociation |
    ConditionalAccess |
    ProgramMap |
    Dsmcc |
    NetworkInformation |
    ServiceDescription |
    BouquetAssociation |
    EventInformation |
    TimeAndDate |
    TimeOffset |
    DiscontinuityInformation |
    SelectionInformation |
    Ecm |
    Emm |
    EmmMessage |
    SoftwareDownloadTrigger |
    CommonData
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
    on(event: "pat", fn: (section: ProgramAssociation) => void): void;
    on(event: "cat", fn: (section: ConditionalAccess) => void): void;
    on(event: "pmt", fn: (section: ProgramMap) => void): void;
    on(event: "dsmcc", fn: (section: Dsmcc) => void): void;
    on(event: "nit", fn: (section: Dsmcc) => void): void;
    on(event: "sdt", fn: (section: ServiceDescription) => void): void;
    on(event: "bat", fn: (section: BouquetAssociation) => void): void;
    on(event: "eit", fn: (section: EventInformation) => void): void;
    on(event: "tdt", fn: (section: TimeAndDate) => void): void;
    on(event: "tot", fn: (section: TimeOffset) => void): void;
    on(event: "dit", fn: (section: DiscontinuityInformation) => void): void;
    on(event: "sit", fn: (section: SelectionInformation) => void): void;
    on(event: "ecm", fn: (section: Ecm) => void): void;
    on(event: "emm", fn: (section: Emm) => void): void;
    on(event: "emmm", fn: (section: EmmMessage) => void): void;
    on(event: "sdtt", fn: (section: SoftwareDownloadTrigger) => void): void;
    on(event: "cdt", fn: (section: CommonData) => void): void;
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
                const tsSection = new ProgramAssociation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("pat", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x01) {
                // Conditional access
                const tsSection = new ConditionalAccess(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("cat", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x02) {
                // Program map
                const tsSection = new ProgramMap(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("pmt", tsSection);

                this.push(tsSection);
            } else if (tableId >= 0x3A && tableId <= 0x3F) {
                // DSM-CC
                const tsSection = new Dsmcc(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("dsmcc", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x40 || tableId === 0x41) {
                // Network information
                const tsSection = new NetworkInformation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("nit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x42 || tableId === 0x46) {
                // Service description
                const tsSection = new ServiceDescription(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("sdt", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x4A) {
                // Bouquet association
                const tsSection = new BouquetAssociation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("bat", tsSection);

                this.push(tsSection);
            } else if (tableId >= 0x4E && tableId <= 0x6F) {
                // Event information
                const tsSection = new EventInformation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("eit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x70) {
                // Time and date
                const tsSection = new TimeAndDate(section, pid);

                this.emit("tdt", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x73) {
                // Time offset
                const tsSection = new TimeOffset(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("tot", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x7E) {
                // Discontinuity information
                const tsSection = new DiscontinuityInformation(section, pid);

                this.emit("dit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x7F) {
                // Selection information
                const tsSection = new SelectionInformation(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("sit", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x82) {
                // ECM
                const tsSection = new Ecm(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("ecm", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x84) {
                // EMM
                const tsSection = new Emm(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("emm", tsSection);

                this.push(tsSection);
            } else if (tableId === 0x85) {
                // EMM message
                const tsSection = new EmmMessage(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("emmm", tsSection);

                this.push(tsSection);
            } else if (tableId === 0xC3) {
                // Software download trigger
                const tsSection = new SoftwareDownloadTrigger(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("sdtt", tsSection);

                this.push(tsSection);
            } else if (tableId === 0xC8) {
                // Common data
                const tsSection = new CommonData(section, pid);

                if (!tsSection.checkCrc32()) {
                    continue;
                }

                this.emit("cdt", tsSection);

                this.push(tsSection);
            } else {
                // private section, pipe as TsSectionBase
                const tsSection = new Base(section, pid);

                this.push(tsSection);
            }
        }

        callback();
    }
}
