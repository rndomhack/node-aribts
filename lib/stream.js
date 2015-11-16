"use strict";

const stream = require("stream");
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
            bufferSize: 0
        }, options);

        this.buffer = {
            chunks: [],
            length: 0
        };

        this.TsInfo = class {
            constructor() {
                this.name = "";
                this.packet = 0;
                this.counter = -1;
                this.drop = 0;
                this.scrambling = 0;
                this.type = 0;
                this.buffer = {
                    chunks: [],
                    length: 0,
                    entireLength: 0
                };
            }

            addBuffer(chunk) {
                this.buffer.chunks.push(chunk);
                this.buffer.length += chunk.length;
            }

            resetBuffer() {
                this.buffer.chunks.length = 0;
                this.buffer.length = 0;
                this.buffer.entireLength = 0;
            }

            concatBuffer() {
                return Buffer.concat(this.buffer.chunks);
            }

            toObject() {
                return {
                    packet: this.packet,
                    drop: this.drop,
                    scrambling: this.scrambling
                };
            }
        };

        this.info = {};
    }

    addBuffer(chunk) {
        this.buffer.chunks.push(chunk);
        this.buffer.length += chunk.length;
    }

    resetBuffer() {
        this.buffer.chunks.length = 0;
        this.buffer.length = 0;
    }

    concatBuffer() {
        return Buffer.concat(this.buffer.chunks);
    }

    toPacket(buffer) {
        var packets = [];
        var i = 0;

        // Find sync_byte
        for (; buffer.length - i >= this.options.packetSize; i += this.options.packetSize) {
            if (buffer[0] !== 0x47 && (i = buffer.indexOf(0x47, i)) === -1) break;

            packets.push(buffer.slice(i, i + this.options.packetSize));
        }


        return {
            packets: packets,
            buffer: i !== -1 ? buffer.slice(i) : null
        };
    }

    parse(buffer) {
        // Convert buffer into packet
        var result = this.toPacket(buffer);

        result.packets.forEach(packet => {
            if (this.options.skipSize > 0 && this.options.skipSize-- !== 0) return;

            // Create TsPacket instance
            var tsPacket = new TsPacket(packet);

            // Decode basic struct
            var objBasic = tsPacket.decodeBasic();

            // Check transport_error_indicator
            if (objBasic.transport_error_indicator === 1) return;

            // Add new PidInfo
            if (!this.info.hasOwnProperty(objBasic.PID)) {
                this.info[objBasic.PID] = new this.TsInfo();
            }

            var info = this.info[objBasic.PID];
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
                if (info.counter !== -1) {
                    let counter = objBasic.continuity_counter;
                    let expected = (info.counter + 1) & 0x0F;

                    if (expected !== counter) {
                        // Process drop
                        //let drop = counter - expected + (expected > counter ? 0x10 : 0x00);
                        info.drop++;
                        info.type = 0;
                        info.resetBuffer();

                        // Emit "drop" event
                        if (this.listenerCount("drop")) {
                            this.emit("drop", objBasic.PID, expected, counter);
                        }
                    }
                }

                // Check scramble
                if (objBasic.transport_scrambling_control >> 1 === 1) {
                    // Process scramble
                    info.scrambling++;

                    // Emit "scrambling" event
                    if (this.listenerCount("scrambling")) {
                        this.emit("scrambling", objBasic.PID);
                    }
                }

                // Set counter
                info.counter = objBasic.continuity_counter;

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
                                info.addBuffer(data.slice(bytesRead, bytesRead + pointerField));

                                // Add section
                                sections.push(info.concatBuffer());
                            } else {
                                // Invalid data
                                info.type = 0;
                            }

                            // Reset chunk
                            info.resetBuffer();
                        }

                        bytesRead += pointerField;

                        while (data.length >= bytesRead + 3 && data[bytesRead] !== 0xFF) {
                            let sectionLength = 3 + ((data[bytesRead + 1] & 0x0F) << 8 | data[bytesRead + 2]);

                            if (data.length < bytesRead + sectionLength) {
                                // Add buffer
                                info.addBuffer(data.slice(bytesRead, data.length));
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
                                info.addBuffer(data);
                            } else {
                                // Add buffer
                                info.addBuffer(data.slice(0, restLength));

                                // Add section
                                sections.push(info.concatBuffer());

                                // Reset chunk
                                info.resetBuffer();
                            }
                        }
                    }
                }

                sections.forEach(section => {
                    let tableId = section[0];

                    if (tableId === 0x00) {
                        // PAT
                        if (this.listenerCount("pat")) {
                            this.emit("pat", objBasic.PID, new tsTable.TsTablePat(section).decode());
                        }
                    } else if (tableId === 0x01) {
                        // CAT
                        if (this.listenerCount("cat")) {
                            this.emit("cat", objBasic.PID, new tsTable.TsTableCat(section).decode());
                        }
                    } else if (tableId === 0x02) {
                        // PMT
                        if (this.listenerCount("pmt")) {
                            this.emit("pmt", objBasic.PID, new tsTable.TsTablePmt(section).decode());
                        }
                    } else if (tableId === 0x40 || tableId === 0x41) {
                        // NIT
                        if (this.listenerCount("nit")) {
                            this.emit("nit", objBasic.PID, new tsTable.TsTableNit(section).decode());
                        }
                    } else if (tableId === 0x42 || tableId === 0x46) {
                        // SDT
                        if (this.listenerCount("sdt")) {
                            this.emit("sdt", objBasic.PID, new tsTable.TsTableSdt(section).decode());
                        }
                    } else if (tableId === 0x4A) {
                        // BAT
                        if (this.listenerCount("bat")) {
                            this.emit("bat", objBasic.PID, new tsTable.TsTableNit(section).decode());
                        }
                    } else if (tableId >= 0x4E && tableId <= 0x6F) {
                        // EIT
                        if (this.listenerCount("eit")) {
                            this.emit("eit", objBasic.PID, new tsTable.TsTableEit(section).decode());
                        }
                    } else if (tableId === 0x70) {
                        // TDT
                        if (this.listenerCount("tdt")) {
                            this.emit("tdt", objBasic.PID, new tsTable.TsTableTdt(section).decode());
                        }
                    } else if (tableId === 0x73) {
                        // TOT
                        if (this.listenerCount("tot")) {
                            this.emit("tot", objBasic.PID, new tsTable.TsTableTot(section).decode());
                        }
                    }
                });
            }

            // Output packet
            this.push(packet);
        });

        return result.buffer;
    }

    _transform(chunk, encoding, callback) {
        // Add chunk to buffer
        this.addBuffer(chunk);

        if (this.options.bufferSize !== -1 && this.buffer.length > this.options.bufferSize) {
            // Parse buffer
            let buffer = this.parse(this.concatBuffer());

            // Reset buffer
            this.resetBuffer();
            if (buffer !== null) this.addBuffer(buffer);
        }

        callback();
    }

    _flush(callback) {
        // Parse buffer
        var buffer = this.parse(this.concatBuffer());

        // Reset buffer
        this.resetBuffer();

        // Output buffer
        this.push(buffer);

        // Emit "info" event
        if (this.listenerCount("info")) {
            let info = {};

            Object.keys(this.info).forEach(key => {
                info[key] = this.info[key].toObject();
            });

            this.emit("info", info);
        }

        callback();
    }
}

module.exports = TsStream;
