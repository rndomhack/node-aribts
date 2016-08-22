"use strict";

const crc = require('crc');
const TsReader = require("./reader");

const clutColorPalette = [
    [0  , 0  , 0  , 255],
    [255, 0  , 0  , 255],
    [0  , 255, 0  , 255],
    [255, 255, 0  , 255],
    [0  , 0  , 255, 255],
    [255, 0  , 255, 255],
    [0  , 255, 255, 255],
    [255, 255, 255, 255],
    [0  , 0  , 0  , 0  ],
    [170, 0  , 0  , 255],
    [0  , 170, 0  , 255],
    [170, 170, 0  , 255],
    [0  , 0  , 170, 255],
    [170, 0  , 170, 255],
    [0  , 170, 170, 255],
    [170, 170, 170, 255],
    [0  , 0  , 85 , 255],
    [0  , 85 , 0  , 255],
    [0  , 85 , 85 , 255],
    [0  , 85 , 170, 255],
    [0  , 85 , 255, 255],
    [0  , 170, 85 , 255],
    [0  , 170, 255, 255],
    [0  , 255, 85 , 255],
    [0  , 255, 170, 255],
    [85 , 0  , 0  , 255],
    [85 , 0  , 85 , 255],
    [85 , 0  , 170, 255],
    [85 , 0  , 255, 255],
    [85 , 85 , 0  , 255],
    [85 , 85 , 85 , 255],
    [85 , 85 , 170, 255],
    [85 , 85 , 255, 255],
    [85 , 170, 0  , 255],
    [85 , 170, 85 , 255],
    [85 , 170, 170, 255],
    [85 , 170, 255, 255],
    [85 , 255, 0  , 255],
    [85 , 255, 85 , 255],
    [85 , 255, 170, 255],
    [85 , 255, 255, 255],
    [170, 0  , 85 , 255],
    [170, 0  , 255, 255],
    [170, 85 , 0  , 255],
    [170, 85 , 85 , 255],
    [170, 85 , 170, 255],
    [170, 85 , 255, 255],
    [170, 170, 85 , 255],
    [170, 170, 255, 255],
    [170, 255, 0  , 255],
    [170, 255, 85 , 255],
    [170, 255, 170, 255],
    [170, 255, 255, 255],
    [255, 0  , 85 , 255],
    [255, 0  , 255, 255],
    [255, 85 , 0  , 255],
    [255, 85 , 85 , 255],
    [255, 85 , 170, 255],
    [255, 85 , 255, 255],
    [255, 170, 0  , 255],
    [255, 170, 85 , 255],
    [255, 170, 170, 255],
    [255, 170, 255, 255],
    [255, 255, 85 , 255],
    [255, 255, 255, 255],
    [0  , 0  , 0  , 128],
    [255, 0  , 0  , 128],
    [0  , 255, 0  , 128],
    [255, 255, 0  , 128],
    [0  , 0  , 255, 128],
    [255, 0  , 255, 128],
    [0  , 255, 255, 128],
    [255, 255, 255, 128],
    [170, 0  , 0  , 128],
    [0  , 170, 0  , 128],
    [170, 170, 0  , 128],
    [0  , 0  , 170, 128],
    [170, 0  , 170, 128],
    [0  , 170, 170, 128],
    [170, 170, 170, 128],
    [0  , 0  , 85 , 128],
    [0  , 85 , 0  , 128],
    [0  , 85 , 85 , 128],
    [0  , 85 , 170, 128],
    [0  , 85 , 255, 128],
    [0  , 170, 85 , 128],
    [0  , 170, 255, 128],
    [0  , 255, 85 , 128],
    [0  , 255, 170, 128],
    [85 , 0  , 0  , 128],
    [85 , 0  , 85 , 128],
    [85 , 0  , 170, 128],
    [85 , 0  , 255, 128],
    [85 , 85 , 0  , 128],
    [85 , 85 , 85 , 128],
    [85 , 85 , 170, 128],
    [85 , 85 , 255, 128],
    [85 , 170, 0  , 128],
    [85 , 170, 85 , 128],
    [85 , 170, 170, 128],
    [85 , 170, 255, 128],
    [85 , 255, 0  , 128],
    [85 , 255, 85 , 128],
    [85 , 255, 170, 128],
    [85 , 255, 255, 128],
    [170, 0  , 85 , 128],
    [170, 0  , 255, 128],
    [170, 85 , 0  , 128],
    [170, 85 , 85 , 128],
    [170, 85 , 170, 128],
    [170, 85 , 255, 128],
    [170, 170, 85 , 128],
    [170, 170, 255, 128],
    [170, 255, 0  , 128],
    [170, 255, 85 , 128],
    [170, 255, 170, 128],
    [170, 255, 255, 128],
    [255, 0  , 85 , 128],
    [255, 0  , 255, 128],
    [255, 85 , 0  , 128],
    [255, 85 , 85 , 128],
    [255, 85 , 170, 128],
    [255, 85 , 255, 128],
    [255, 170, 0  , 128],
    [255, 170, 85 , 128],
    [255, 170, 170, 128],
    [255, 170, 255, 128],
    [255, 255, 85 , 128],
    [255, 255, 255, 128],
];

class TsLogo {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDataModule = {};

        objDataModule.logo_type = reader.uimsbf(8);
        reader.next(7);    // reserved_future_use
        objDataModule.logo_id = reader.uimsbf(9)
        reader.next(4);    // reserved_future_use
        objDataModule.logo_version = reader.uimsbf(12);
        objDataModule.data_size = reader.uimsbf(16);
        objDataModule.data_byte = reader.readBytes(objDataModule.data_size);

        return objDataModule;
    }

    decodePng() {
        const paletteLength = clutColorPalette.length;
        let dataBuffer = this.decode().data_byte;

        // PLTE chunk
        let plteBuffer = new Buffer(12 + paletteLength * 3);
        plteBuffer.writeUInt32BE(paletteLength * 3, 0);
        plteBuffer.writeUInt32BE(0x504C5445, 4); // PLTE
        for (let i = 0; i < paletteLength; i++) {
            plteBuffer.writeUInt8(clutColorPalette[i][0], 8 + i * 3);
            plteBuffer.writeUInt8(clutColorPalette[i][1], 8 + i * 3 + 1);
            plteBuffer.writeUInt8(clutColorPalette[i][2], 8 + i * 3 + 2);
        }
        let plteCrc = crc.crc32(plteBuffer.slice(4, 8 + paletteLength * 3));
        plteBuffer.writeInt32BE(plteCrc, 8 + paletteLength * 3);

        // tRNS chunk
        let trnsBuffer = new Buffer(12 + paletteLength);
        trnsBuffer.writeUInt32BE(paletteLength, 0);
        trnsBuffer.writeUInt32BE(0x74524E53, 4); // tRNS
        for (let i = 0; i < paletteLength; i++) {
            trnsBuffer.writeUInt8(clutColorPalette[i][3], 8 + i);
        }
        let trnsCrc = crc.crc32(trnsBuffer.slice(4, 8 + paletteLength));
        trnsBuffer.writeInt32BE(trnsCrc, 8 + paletteLength);

        // concat
        let pngBuffer = new Buffer(this.buffer.length + plteBuffer.length + trnsBuffer.length);
        dataBuffer.copy(pngBuffer, 0, 0, 33); // IHDR
        plteBuffer.copy(pngBuffer, 33); // PLTE
        trnsBuffer.copy(pngBuffer, 33 + plteBuffer.length); // tRNS
        dataBuffer.copy(pngBuffer, 33 + plteBuffer.length + trnsBuffer.length, 33); // IDAT

        return pngBuffer;
    }
}

module.exports = TsLogo;
