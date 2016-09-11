"use strict";

const TsBase = require("./base");
const TsBuffer = require("./buffer");
const TsPacket = require("./packet");

class TsPacketParser extends TsBase {
    constructor(options) {
        super();

        this.options = Object.assign({
            packetSize: 188
        }, options || {});

        this.buffer = new TsBuffer();

        this.packetSize = 188;
        this.packetIgnoreSize = this.options.packetSize - 188;
    }

    process(chunk) {
        const tsPackets = [];
        let bytesRead = 0;

        if (this.buffer.length !== 0) {
            if (this.buffer.length + chunk.length < this.packetSize) {
                // Add chunk
                this.buffer.add(chunk);

                return;
            } else {
                // Get part
                const part = chunk.slice(0, this.packetSize - this.buffer.length);

                // Add part
                this.buffer.add(part);
                bytesRead += part.length;

                // Push packet
                tsPackets.push(new TsPacket(this.buffer.concat()));

                // Clear buffer
                this.buffer.clear();
            }
        }

        for (let l = chunk.length; bytesRead < l; ) {
            if (chunk[bytesRead + this.packetIgnoreSize] === 0x47) {
                // Skip ignore size
                bytesRead += this.packetIgnoreSize;
            } else {
                // Find sync_byte
                bytesRead = chunk.indexOf(0x47, bytesRead);

                // Can't find sync_byte
                if (bytesRead === -1) break;
            }

            if (chunk.length - bytesRead < this.packetSize) {
                // Add buffer
                this.buffer.add(chunk.slice(bytesRead));

                break;
            }

            // Push packet
            tsPackets.push(new TsPacket(chunk.slice(bytesRead, bytesRead + this.packetSize)));

            bytesRead += this.packetSize;
        }

        for (let i = 0, l = tsPackets.length; i < l; i++) {
            this.push(tsPackets[i]);
        }
    }
}

module.exports = TsPacketParser;
