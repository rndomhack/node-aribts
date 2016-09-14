"use strict";

const TsPacket = require("./packet");
const TsUtil = require("./util");
const TsBase = require("./base");
const tsSectionList = require("./section");

class TsPacketSelector extends TsBase {
    constructor(options) {
        super();

        this.options = Object.assign({
            pids: [],
            programNumbers: []
        }, options || {});

        this.versions = {};

        this.pids = [];
        this.pat = null;
        this.cat = null;
        this.pmt = {};

        this.rebuiltPatPackets = [];
        this.rebuiltPatVersion = 0;
        this.rebuiltPatCounter = 0;
    }

    _process(tsPacket) {
        const pid = tsPacket.getPid();

        if (pid === 0) {
            if (tsPacket.getPayloadUnitStartIndicator() === 1) {
                const patPackets = this.createPatPackets();

                for (let i = 0, l = patPackets.length; i < l; i++) {
                    this.push(patPackets[i]);
                }
            }
        } else if (this.pids.includes(pid)) {
            this.push(tsPacket);
        }
    }

    onPat(tsSection) {
        const subTable = TsUtil.getNestedObject(this.versions, [tsSection.getTableId(), tsSection.getTransportStreamId()]);

        TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        this.pat = tsSection;

        this.updatePids();
        this.rebuildPatPackets();
    }

    onCat(tsSection) {
        const subTable = TsUtil.getNestedObject(this.versions, [tsSection.getTableId()]);

        TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        this.cat = tsSection;

        this.updatePids();
    }

    onPmt(tsSection) {
        const subTable = TsUtil.getNestedObject(this.versions, [tsSection.getTableId(), tsSection.getProgramNumber()]);

        TsUtil.updateSubTable(subTable, tsSection);

        if (!TsUtil.updateSection(subTable, tsSection)) return;

        this.pmt[tsSection.getProgramNumber()] = tsSection;

        this.updatePids();
    }

    updatePids() {
        const pids = this.options.pids.slice();
        const programNumbers = this.options.programNumbers;

        // Add PAT PID
        pids.push(0x0000);

        // PAT
        if (this.pat !== null) {
            const objSection = this.pat.decode();
            const programs = objSection.programs;

            for (let i = 0, l = programs.length; i < l; i++) {
                const program = programs[i];

                if (program.program_number === 0) {
                    if (pids.includes(program.network_PID)) continue;

                    // Add NIT PID
                    pids.push(program.network_PID);
                } else {
                    if (pids.includes(program.program_map_PID)) continue;
                    if (!programNumbers.includes(program.program_number)) continue;

                    // Add PMT PID
                    pids.push(program.program_map_PID);
                }
            }
        }

        // CAT
        if (this.cat !== null) {
            const objSection = this.cat.decode();
            const tsDescriptors = objSection.descriptors.decode();

            for (let i = 0, l = tsDescriptors.length; i < l; i++) {
                const tsDescriptor = tsDescriptors[i];

                switch (tsDescriptor.getDescriptorTag()) {
                    case 0x09: {
                        // Conditional access
                        const objDescriptor = tsDescriptor.decode();

                        if (pids.includes(objDescriptor.CA_PID)) break;

                        // Add EMM PID
                        pids.push(objDescriptor.CA_PID);

                        break;
                    }

                    case 0xF6: {
                        // Access control
                        const objDescriptor = tsDescriptor.decode();

                        if (pids.includes(objDescriptor.PID)) break;

                        // Add EMM PID
                        pids.push(objDescriptor.PID);

                        break;
                    }

                    case 0xF8: {
                        // Conditional playback
                        const objDescriptor = tsDescriptor.decode();

                        if (pids.includes(objDescriptor.conditional_playback_PID)) break;

                        // Add EMM PID
                        pids.push(objDescriptor.conditional_playback_PID);

                        break;
                    }
                }
            }
        }

        // PMT
        for (let keys = Object.keys(this.pmt), i = 0, l = keys.length; i < l; i++) {
            const pmt = this.pmt[keys[i]];

            if (!pids.includes(pmt.getPid())) continue;

            const objSection = pmt.decode();
            const tsDescriptors = objSection.program_info.decode();
            const streams = objSection.streams;

            if (!pids.includes(objSection.PCR_PID)) {
                // Add PCR PID
                pids.push(objSection.PCR_PID);
            }

            for (let j = 0, l2 = tsDescriptors.length; j < l2; j++) {
                const tsDescriptor = tsDescriptors[j];

                switch (tsDescriptor.getDescriptorTag()) {
                    case 0x09: {
                        // Conditional access
                        const objDescriptor = tsDescriptor.decode();

                        if (pids.includes(objDescriptor.CA_PID)) break;

                        // Add ECM PID
                        pids.push(objDescriptor.CA_PID);

                        break;
                    }

                    case 0xF6: {
                        // Access control
                        const objDescriptor = tsDescriptor.decode();

                        if (pids.includes(objDescriptor.PID)) break;

                        // Add ECM PID
                        pids.push(objDescriptor.PID);

                        break;
                    }

                    case 0xF8: {
                        // Conditional playback
                        const objDescriptor = tsDescriptor.decode();

                        if (pids.includes(objDescriptor.conditional_playback_PID)) break;

                        // Add ECM PID
                        pids.push(objDescriptor.conditional_playback_PID);

                        break;
                    }
                }
            }

            for (let j = 0, l2 = streams.length; j < l2; j++) {
                const stream = streams[j];

                if (pids.includes(stream.elementary_PID)) continue;

                // Add ES PID
                pids.push(stream.elementary_PID);
            }
        }

        this.pids = pids;
    }

    rebuildPatPackets() {
        if (this.pat === null) return;

        const patPackets = [];

        const objPacket = {
            header: {
                payload_unit_start_indicator: 1,
                transport_priority: 1,
                PID: 0,
                transport_scrambling_control: 0,
                adaptation_field_control: 1,
                continuity_counter: 0
            },
            data: null
        };

        const objSection = {
            table_id: 0,
            section_syntax_indicator: 1,
            transport_stream_id: this.pat.getTransportStreamId(),
            version_number: this.rebuiltPatVersion,
            current_next_indicator: 1,
            section_number: 0,
            last_section_number: 0,
            programs:[]
        };

        const programs = this.pat.decode().programs;

        for (let i = 0, l = programs.length; i < l; i++) {
            const program = programs[i];

            if (program.program_number === 0) {
                if (!this.pids.includes(program.network_PID)) continue;

                // Add NIT
                objSection.programs.push(program);
            } else {
                if (!this.pids.includes(program.program_map_PID)) continue;

                // Add PMT
                objSection.programs.push(program);
            }
        }

        const tsSection = new tsSectionList.TsSectionProgramAssociation();

        // Encode section
        tsSection.encode(objSection);

        // Get data buffer
        const packetDataBuffer = tsSection.getPacketDataBuffer();

        for (let bytesRead = 0, l = packetDataBuffer.length; bytesRead < l; ) {
            const remainingLength = packetDataBuffer.length - bytesRead;

            if (remainingLength > 184) {
                objPacket.data = packetDataBuffer.slice(bytesRead, bytesRead + 184);
                bytesRead += 184;
            } else {
                objPacket.data = packetDataBuffer.slice(bytesRead, packetDataBuffer.length);
                bytesRead += remainingLength;
            }

            const tsPacket = new TsPacket();

            // Encode packet
            tsPacket.encode(objPacket);

            // Add packet
            patPackets.push(tsPacket);

            objPacket.payload_unit_start_indicator = 0;
        }

        this.rebuiltPatPackets = patPackets;
        this.rebuiltPatVersion = (this.rebuiltPatVersion + 1) & 0x1F;
    }

    createPatPackets() {
        const patPackets = [];

        for (let i = 0, l = this.rebuiltPatPackets.length; i < l; i++) {
            const patPacket = this.rebuiltPatPackets[i];

            const packetBuffer = Buffer.from(patPacket.getBuffer());

            // Update continuity_counter
            packetBuffer[3] = (packetBuffer[3] & 0xF0) | this.rebuiltPatCounter;
            this.rebuiltPatCounter = (this.rebuiltPatCounter + 1) & 0x0F;

            patPackets.push(new TsPacket(packetBuffer));
        }

        return patPackets;
    }

    reset() {
        this.pids = [];
        this.pat = null;
        this.cat = null;
        this.pmt = {};

        this.rebuiltPatPackets = [];
        this.rebuiltPatVersion = 0;
        this.rebuiltPatCounter = 0;
    }

    setPids(pids) {
        this.options.pids = pids;
    }

    setProgramNumbers(programNumbers) {
        this.options.programNumbers = programNumbers;
    }
}

module.exports = TsPacketSelector;
