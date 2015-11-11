"use strict";

const stream = require("stream");
const TsPacketParser = require("./packet");
const TsPatParser = require("./pat");
const TsPmtParser = require("./pmt");

class PidInfo {
    constructor() {
        this.name = "";
        this.packet = 0;
        this.counter = -1;
        this.drop = 0;
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
}

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

        this.parser = {
            packet: new TsPacketParser(),
            pat: new TsPatParser(),
            pmt: new TsPmtParser()
        };

        this.buffer = {
            chunks: [],
            length: 0
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
        while ((i = buffer.indexOf(0x47, i)) !== -1) {
            if (buffer.length - i < this.options.packetSize) break;

            packets.push(buffer.slice(i, i + this.options.packetSize));
            i += this.options.packetSize;
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

            var objBasic = this.parser.packet.parseBasic(packet);

            if (!this.info.hasOwnProperty(objBasic.PID)) {
                this.info[objBasic.PID] = new PidInfo();
            }

            var info = this.info[objBasic.PID];
            info.packet++;

            // Emit "packet" event
            if (this.listenerCount("packet")) {
                this.emit("packet", objBasic.PID, this.parser.packet.parse(packet));
            }

            // Exists data
            if ((objBasic.adaptation_field_control & 0x01) === 1) {
                let sections = [];

                // Check drop
                if (info.counter !== -1) {
                    let counter = objBasic.continuity_counter;
                    let expected = (info.counter + 1) & 0x0F;

                    if (expected !== counter) {
                        // Process drop
                        let drop = counter - expected + (expected > counter ? 0x0F : 0x00);

                        if (this.listenerCount("drop")) {
                            this.emit("drop", objBasic.PID, drop);
                        }

                        info.drop += drop;
                        info.type = 0;
                        info.resetBuffer();
                    }
                }

                // Set counter
                info.counter = objBasic.continuity_counter;

                // Is first packet
                if (objBasic.payload_unit_start_indicator === 1) {
                    if (this.parser.packet.isPes(packet)) {
                        // PES
                        info.type = 1;
                    } else {
                        // PSI/SI
                        info.type = 2;

                        let data = this.parser.packet.getData(packet);
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
                            let data = this.parser.packet.getData(packet);
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

                    switch (tableId) {
                        case 0x00:
                            // PAT
                            if (this.listenerCount("pat")) {
                                this.emit("pat", objBasic.PID, this.parser.pat.parse(section));
                            }
                            break;

                        case 0x02:
                            // PMT
                            if (this.listenerCount("pmt")) {
                                this.emit("pmt", objBasic.PID, this.parser.pmt.parse(section));
                            }
                            break;
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

        callback();
    }
}

module.exports = TsStream;
