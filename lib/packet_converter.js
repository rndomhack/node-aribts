"use strict";

const TsBase = require("./base");
const TsBuffer = require("./buffer");

class TsPacketConverter extends TsBase {
    constructor(options) {
        super();

        this._options = Object.assign({
            bufferSize: 65536
        }, options || {});

        this._buffer = new TsBuffer();
    }

    _process(tsPacket, callback) {
        const chunk = tsPacket.getBuffer();

        if (this._buffer.length === 0) {
            if (chunk.length >= this._options.bufferSize) {
                this.push(chunk);
            } else {
                this._buffer.add(chunk);
            }
        } else {
            this._buffer.add(chunk);

            if (this._buffer.length >= this._options.bufferSize) {
                this.push(this._buffer.concat());

                this._buffer.clear();
            }
        }

        callback();
    }

    _flush(callback) {
        this.push(this._buffer.concat());

        callback();
    }
}

module.exports = TsPacketConverter;
