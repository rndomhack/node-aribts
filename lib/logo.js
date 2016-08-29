"use strict";

const crc = require("crc");
const logoClut = require("./logo_clut");

let plteBuffer, trnsBuffer;

{
    let bytesWritten;

    // PLTE chunk
    plteBuffer = Buffer.alloc(4 + 4 + logoClut.length * 3 + 4);
    bytesWritten = 0;

    plteBuffer.writeUInt32BE(logoClut.length * 3, bytesWritten);
    bytesWritten += 4;
    Buffer.from("PLTE").copy(plteBuffer, bytesWritten);
    bytesWritten += 4;

    for (let palette of logoClut) {
        plteBuffer.writeUInt8(palette[0], bytesWritten++);
        plteBuffer.writeUInt8(palette[1], bytesWritten++);
        plteBuffer.writeUInt8(palette[2], bytesWritten++);
    }

    plteBuffer.writeInt32BE(crc.crc32(plteBuffer.slice(4, bytesWritten)), bytesWritten);

    // tRNS chunk
    trnsBuffer = Buffer.alloc(4 + 4 + logoClut.length + 4);
    bytesWritten = 0;

    trnsBuffer.writeUInt32BE(logoClut.length, bytesWritten);
    bytesWritten += 4;
    Buffer.from("tRNS").copy(trnsBuffer, bytesWritten);
    bytesWritten += 4;

    for (let palette of logoClut) {
        trnsBuffer.writeUInt8(palette[3], bytesWritten++);
    }

    trnsBuffer.writeInt32BE(crc.crc32(trnsBuffer.slice(4, bytesWritten)), bytesWritten);
}

class TsLogo {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let pngBufferList = [this.buffer.slice(0, 33), plteBuffer, trnsBuffer, this.buffer.slice(33)];
        let pngBufferLength = this.buffer.length + plteBuffer.length + trnsBuffer.length;

        let pngBuffer = Buffer.concat(pngBufferList, pngBufferLength);

        return pngBuffer;
    }
}

module.exports = TsLogo;
