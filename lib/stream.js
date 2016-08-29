"use strict";

const stream = require("stream");
const TsBuffer = require("./buffer");
const TsPacket = require("./packet");
const tsTable = require("./table");

class TsStream extends stream.Transform {
    constructor(options) {
        super();

        // TODO: Default parameters
        options = options || {};

        this.options = Object.assign({
            transform: false,
            skipSize: 0,
            packetSize: 188,
            bufferSize: 0,
            transPmtIds: [],
            transPmtSids: [],
            transPmtPids: [],
            transPids: []
        }, options);

        this.buffer = new TsBuffer();

        this.info = {};

        this.TsInfo = class {
            constructor() {
                this.name = "";
                this.packet = 0;
                this.counter = -1;
                this.duplication = 0;
                this.type = 0;

                this.drop = 0;
                this.scrambling = 0;

                this.buffer = new TsBuffer();
                this.buffer.entireLength = 0;
            }

            toObject() {
                return {
                    packet: this.packet,
                    drop: this.drop,
                    scrambling: this.scrambling
                };
            }
        };

        this.trans = {
            pat: null,
            cat: null,
            pmt: {},
            pmtPids: [],
            pids: [],
            rebuild: {
                pat: null,
                patCounter: 0,
                patVersion: 0
            }
        };
    }

    toPacket(buffer) {
        let packets = [];
        let i = 0;

        // Find sync_byte
        if (this.options.packetSize === 192) {
            for (; buffer.length - i >= 192; i += 192) {
                if (buffer[4] !== 0x47 && (i = buffer.indexOf(0x47, i) - 4) === -5) break;

                packets.push(buffer.slice(i + 4, i + 192));
            }
        } else {
            for (; buffer.length - i >= 188; i += 188) {
                if (buffer[0] !== 0x47 && (i = buffer.indexOf(0x47, i)) === -1) break;

                packets.push(buffer.slice(i, i + 188));
            }
        }


        return {
            packets: packets,
            buffer: i !== -1 ? buffer.slice(i) : null
        };
    }

    parse(buffer) {
        // Convert buffer into packet
        let result = this.toPacket(buffer);

        for (let packet of result.packets) {
            if (this.options.skipSize > 0 && this.options.skipSize-- !== 0) continue;

            // Create TsPacket instance
            let tsPacket = new TsPacket(packet);

            // Decode basic struct
            let objBasic = tsPacket.decodeBasic();

            // Check transport_error_indicator
            if (objBasic.transport_error_indicator === 1) continue;

            // Add new PidInfo
            if (!this.info.hasOwnProperty(objBasic.PID)) {
                this.info[objBasic.PID] = new this.TsInfo();
            }

            let info = this.info[objBasic.PID];
            info.packet++;

            // Emit "packet" event
            if (this.listenerCount("packet")) {
                this.emit("packet", objBasic.PID, tsPacket.decode(packet));
            }

            // Exists data
            if ((objBasic.adaptation_field_control & 0x01) === 1) {
                let sections = [];

                // Check discontinuity_indicator
                if (objBasic.hasOwnProperty("adaptation_field") &&
                    objBasic.adaptation_field.discontinuity_indicator === 1) {
                    // Reset counter
                    info.counter = -1;
                }

                // Check drop
                if (info.counter !== -1 && objBasic.PID !== 0x1FFF) {
                    let counter = objBasic.continuity_counter;
                    let previous = info.counter;
                    let expected = (previous + 1) & 0x0F;
                    let check = true;

                    if (counter === previous) {
                        info.duplication++;

                        if (info.duplication > 1) {
                            check = false;
                        }
                    } else {
                        info.duplication = 0;

                        if (counter !== expected) {
                            check = false;
                        }
                    }

                    if (!check) {
                        // Process drop
                        info.drop++;
                        info.type = 0;
                        info.buffer.reset();

                        // Emit "drop" event
                        if (this.listenerCount("drop")) {
                            this.emit("drop", objBasic.PID, counter, expected);
                        }
                    }
                }

                // Set counter
                info.counter = objBasic.continuity_counter;

                // Check scramble
                if (objBasic.transport_scrambling_control >> 1 === 1) {
                    // Process scramble
                    info.scrambling++;

                    // Emit "scrambling" event
                    if (this.listenerCount("scrambling")) {
                        this.emit("scrambling", objBasic.PID);
                    }
                } else {
                    // Is first packet
                    if (objBasic.payload_unit_start_indicator === 1) {
                        if (TsPacket.isPes(packet)) {
                            // PES
                            info.type = 1;
                        } else {
                            // PSI/SI
                            info.type = 2;

                            let data = TsPacket.getData(packet);
                            let bytesRead = 0;

                            let pointerField = data[0];
                            bytesRead++;

                            if (pointerField !== 0 && info.buffer.length !== 0) {
                                // Multi section
                                if (info.buffer.entireLength - info.buffer.length === pointerField) {
                                    // Add buffer
                                    info.buffer.add(data.slice(bytesRead, bytesRead + pointerField));

                                    // Add section
                                    sections.push(info.buffer.concat());
                                } else {
                                    // Invalid data
                                    info.type = 0;
                                }
                            }

                            if (info.buffer.length !== 0) {
                                // Reset chunk
                                info.buffer.reset();
                                info.buffer.entireLength = 0;
                            }

                            bytesRead += pointerField;

                            while (data.length >= bytesRead + 3 && data[bytesRead] !== 0xFF) {
                                let sectionLength = 3 + ((data[bytesRead + 1] & 0x0F) << 8 | data[bytesRead + 2]);

                                if (data.length < bytesRead + sectionLength) {
                                    // Add buffer
                                    info.buffer.add(data.slice(bytesRead, data.length));
                                    info.buffer.entireLength = sectionLength;
                                    break;
                                }

                                // Add section
                                sections.push(data.slice(bytesRead, bytesRead + sectionLength));

                                bytesRead += sectionLength;
                            }
                        }
                    } else {
                        if (info.type === 1) {
                            // PES
                        } else if (info.type === 2) {
                            // PSI/SI

                            if (info.buffer.length !== 0) {
                                // Continuing section
                                let data = TsPacket.getData(packet);
                                let restLength = info.buffer.entireLength - info.buffer.length;

                                if (data.length < restLength) {
                                    // Add buffer
                                    info.buffer.add(data);
                                } else {
                                    // Add buffer
                                    info.buffer.add(data.slice(0, restLength));

                                    // Add section
                                    sections.push(info.buffer.concat());

                                    // Reset chunk
                                    info.buffer.reset();
                                    info.buffer.entireLength = 0;
                                }
                            }
                        }
                    }

                    for (let section of sections) {
                        let tableId = section[0];

                        if (tableId === 0x00) {
                            // PAT
                            if (this.listenerCount("pat") || this.options.transform) {
                                let objPat = new tsTable.TsTablePat(section).decode();

                                if (objPat !== null) {
                                    if (this.listenerCount("pat")) {
                                        this.emit("pat", objBasic.PID, objPat);
                                    }

                                    if (this.options.transform) {
                                        this.parsePat(objBasic.PID, objPat);

                                        this.push(this.createPat());
                                    }
                                }
                            }
                        } else if (tableId === 0x01) {
                            // CAT
                            if (this.listenerCount("cat") || this.options.transform) {
                                let objCat = new tsTable.TsTableCat(section).decode();

                                if (objCat !== null) {
                                    if (this.listenerCount("cat")) {
                                        this.emit("cat", objBasic.PID, objCat);
                                    }

                                    if (this.options.transform) {
                                        this.parseCat(objBasic.PID, objCat);
                                    }
                                }
                            }
                        } else if (tableId === 0x02) {
                            // PMT
                            if (this.listenerCount("pmt") || this.options.transform) {
                                let objPmt = new tsTable.TsTablePmt(section).decode();

                                if (objPmt !== null) {
                                    if (this.listenerCount("pmt")) {
                                        this.emit("pmt", objBasic.PID, objPmt);
                                    }

                                    if (this.options.transform) {
                                        this.parsePmt(objBasic.PID, objPmt);
                                    }
                                }
                            }
                        } else if (tableId >= 0x3A && tableId <= 0x3F) {
                            // DSM-CC
                            if (this.listenerCount("dsmcc")) {
                                let objDsmcc = new tsTable.TsTableDsmcc(section).decode();

                                if (objDsmcc !== null) {
                                    this.emit("dsmcc", objBasic.PID, objDsmcc);
                                }
                            }
                        } else if (tableId === 0x40 || tableId === 0x41) {
                            // NIT
                            if (this.listenerCount("nit")) {
                                let objNit = new tsTable.TsTableNit(section).decode();

                                if (objNit !== null) {
                                    this.emit("nit", objBasic.PID, objNit);
                                }
                            }
                        } else if (tableId === 0x42 || tableId === 0x46) {
                            // SDT
                            if (this.listenerCount("sdt")) {
                                let objSdt = new tsTable.TsTableSdt(section).decode();

                                if (objSdt !== null) {
                                    this.emit("sdt", objBasic.PID, objSdt);
                                }
                            }
                        } else if (tableId === 0x4A) {
                            // BAT
                            if (this.listenerCount("bat")) {
                                let objBat = new tsTable.TsTableNit(section).decode();

                                if (objBat !== null) {
                                    this.emit("bat", objBasic.PID, objBat);
                                }
                            }
                        } else if (tableId >= 0x4E && tableId <= 0x6F) {
                            // EIT
                            if (this.listenerCount("eit")) {
                                let objEit = new tsTable.TsTableEit(section).decode();

                                if (objEit !== null) {
                                    this.emit("eit", objBasic.PID, objEit);
                                }
                            }
                        } else if (tableId === 0x70) {
                            // TDT
                            if (this.listenerCount("tdt")) {
                                let objTdt = new tsTable.TsTableTdt(section).decode();

                                if (objTdt !== null) {
                                    this.emit("tdt", objBasic.PID, objTdt);
                                }
                            }
                        } else if (tableId === 0x73) {
                            // TOT
                            if (this.listenerCount("tot")) {
                                let objTot = new tsTable.TsTableTot(section).decode();

                                if (objTot !== null) {
                                    this.emit("tot", objBasic.PID, objTot);
                                }
                            }
                        } else if (tableId === 0x7E) {
                            // DIT
                            if (this.listenerCount("dit")) {
                                let objDit = new tsTable.TsTableDit(section).decode();

                                if (objDit !== null) {
                                    this.emit("dit", objBasic.PID, objDit);
                                }
                            }
                        } else if (tableId === 0x7F) {
                            // SIT
                            if (this.listenerCount("sit")) {
                                let objSit = new tsTable.TsTableSit(section).decode();

                                if (objSit !== null) {
                                    this.emit("sit", objBasic.PID, objSit);
                                }
                            }
                        } else if (tableId === 0xC3) {
                            // SDTT
                            if (this.listenerCount("sdtt")) {
                                let objSdtt = new tsTable.TsTableSdtt(section).decode();

                                if (objSdtt !== null) {
                                    this.emit("sdtt", objBasic.PID, objSdtt);
                                }
                            }
                        } else if (tableId === 0xC8) {
                            // CDT
                            if (this.listenerCount("cdt")) {
                                let objCdt = new tsTable.TsTableCdt(section).decode();

                                if (objCdt !== null) {
                                    this.emit("cdt", objBasic.PID, objCdt);
                                }
                            }
                        }
                    }
                }
            }

            // Output packet
            if (this.options.transform) {
                if (objBasic.PID !== 0 && this.trans.pids.indexOf(objBasic.PID) !== -1) {
                    this.push(packet);
                }
            } else {
                this.push(packet);
            }
        }

        return result.buffer;
    }

    parsePat(pid, objPat) {
        if (this.trans.pat !== null && objPat.version_number === this.trans.pat.version_number) return;

        this.trans.pat = objPat;

        if (this.listenerCount("updatePat")) {
            this.emit("updatePat", pid, objPat);
        }

        this.updatePids();
        this.rebuildPat();
    }

    parseCat(pid, objCat) {
        if (this.trans.cat !== null && objCat.version_number === this.trans.cat.version_number) return;

        this.trans.cat = objCat;

        if (this.listenerCount("updateCat")) {
            this.emit("updateCat", pid, objCat);
        }

        this.updatePids();
    }

    parsePmt(pid, objPmt) {
        if (this.trans.pmt.hasOwnProperty(pid) && objPmt.version_number === this.trans.pmt[pid].version_number) return;

        this.trans.pmt[pid] = objPmt;

        if (this.listenerCount("updatePmt")) {
            this.emit("updatePmt", pid, objPmt);
        }

        this.updatePids();
    }

    updatePids() {
        let pmtPids = this.options.transPmtPids.slice();
        let pids = this.options.transPids.slice();

        // Add PAT PID
        pids.push(0x0000);

        if (this.trans.pat !== null) {
            let detectedPmtId = 0;

            for (let program of this.trans.pat.programs) {
                if (program.program_number === 0) {
                    if (pids.indexOf(program.network_PID) !== -1) continue;

                    // Add NIT PID
                    pids.push(program.network_PID);
                } else {
                    // Detect PMT PID
                    if (pmtPids.indexOf(program.program_map_PID) === -1) {
                        if (this.options.transPmtIds.indexOf(-1) !== -1 ||
                            this.options.transPmtIds.indexOf(detectedPmtId) !== -1 ||
                            this.options.transPmtSids.indexOf(program.program_number) !== -1) {

                            // Add PMT PID to pmtPids
                            pmtPids.push(program.program_map_PID);
                        }
                    }

                    detectedPmtId++;
                }
            }
        }

        if (this.trans.cat !== null) {
            for (let descriptor of this.trans.cat.descriptors) {
                if (descriptor.descriptor_tag !== 0x09) continue;
                if (pids.indexOf(descriptor.CA_PID) !== -1) continue;

                // Add EMM PID
                pids.push(descriptor.CA_PID);
            }
        }

        for (let pmtPid of pmtPids) {
            if (!this.trans.pmt.hasOwnProperty(pmtPid)) continue;

            if (pids.indexOf(pmtPid) === -1) {
                // Add PMT PID
                pids.push(pmtPid);
            }

            if (pids.indexOf(this.trans.pmt[pmtPid].PCR_PID) === -1) {
                // Add PCR PID
                pids.push(this.trans.pmt[pmtPid].PCR_PID);
            }

            for (let descriptor of this.trans.pmt[pmtPid].program_info) {
                if (descriptor.descriptor_tag !== 0x09) continue;
                if (pids.indexOf(descriptor.CA_PID) !== -1) continue;

                // Add ECM PID
                pids.push(descriptor.CA_PID);
            }

            for (let _stream of this.trans.pmt[pmtPid].streams) {
                if (pids.indexOf(_stream.elementary_PID) !== -1) continue;

                // Add ES PID
                pids.push(_stream.elementary_PID);
            }
        }

        this.trans.pmtPids = pmtPids;
        this.trans.pids = pids;
    }

    rebuildPat() {
        // Rebuild PAT
        let objPacket = {
            payload_unit_start_indicator: 1,
            transport_priority: 1,
            PID: 0,
            transport_scrambling_control: 0,
            adaptation_field_control: 1,
            continuity_counter: 0,
            data_byte: null
        };

        let objPat = {
            table_id: 0,
            section_syntax_indicator: 1,
            transport_stream_id: this.trans.pat.transport_stream_id,
            version_number: this.trans.rebuild.patVersion,
            current_next_indicator: 1,
            section_number: 0,
            last_section_number: 0,
            programs:[]
        };

        for (let program of this.trans.pat.programs) {
            if (program.program_number === 0) {
                objPat.programs.push({
                    program_number: program.program_number,
                    network_PID: program.network_PID
                });
            } else {
                if (this.trans.pmtPids.indexOf(program.program_map_PID) !== -1) {
                    objPat.programs.push({
                        program_number: program.program_number,
                        program_map_PID: program.program_map_PID
                    });
                }
            }
        }

        let bufferPat = new tsTable.TsTablePat(Buffer.alloc(0x400, 0xFF)).encode(objPat);

        if (bufferPat.length > 183) {
            throw new RangeError("PAT is too long");
        }

        objPacket.data_byte = Buffer.concat([Buffer.alloc(1), bufferPat]);
        this.trans.rebuild.pat = new TsPacket(Buffer.alloc(188, 0xFF)).encode(objPacket);

        this.trans.rebuild.patVersion = (this.trans.rebuild.patVersion + 1) & 0x1F;
    }

    createPat() {
        let bufferPacket = Buffer.from(this.trans.rebuild.pat);

        // Update continuity_counter
        bufferPacket[3] = (bufferPacket[3] & 0xF0) | this.trans.rebuild.patCounter;
        this.trans.rebuild.patCounter = (this.trans.rebuild.patCounter + 1) & 0x0F;

        return bufferPacket;
    }

    _transform(chunk, encoding, callback) {
        // Add chunk to buffer
        this.buffer.add(chunk);

        if (this.options.bufferSize !== -1 && this.buffer.length > this.options.bufferSize) {
            // Parse buffer
            let buffer = this.parse(this.buffer.concat());

            // Reset buffer
            this.buffer.reset();

            // Add buffer
            if (buffer !== null) this.buffer.add(buffer);
        }

        callback();
    }

    _flush(callback) {
        // Parse buffer
        let buffer = this.parse(this.buffer.concat());

        // Reset buffer
        this.buffer.reset();

        // Output buffer
        this.push(buffer);

        // Emit "info" event
        if (this.listenerCount("info")) {
            let info = {};

            for (let key of Object.keys(this.info)) {
                info[key] = this.info[key].toObject();
            }

            this.emit("info", info);
        }

        callback();
    }
}

module.exports = TsStream;
