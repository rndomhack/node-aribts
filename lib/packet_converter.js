"use strict";

const TsBase = require("./base");
const TsBuffer = require("./buffer");

class TsPacketConverter extends TsBase {
    constructor(options) {
        super();

        this.options = Object.assign({
            bufferSize: 65536
        }, options || {});

        this.buffer = new TsBuffer();
    }

    process(tsPacket) {
        const chunk = tsPacket.getBuffer();

        if (this.buffer.length === 0) {
            if (chunk.length >= this.options.bufferSize) {
                this.push(chunk);
            } else {
                this.buffer.add(chunk);
            }
        } else {
            this.buffer.add(chunk);

            if (this.buffer.length >= this.options.bufferSize) {
                this.push(this.buffer.concat());

                this.buffer.clear();
            }
        }
    }

    finish() {
        this.push(this.buffer.concat());
    }
}

module.exports = TsPacketConverter;
