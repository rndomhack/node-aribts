export interface Descriptor {
    descriptor_tag: number;
    descriptor_length: number;
}

export default class TsCarouselDescriptorBase {
    _buffer: Buffer;

    constructor(buffer: Buffer) {
        this._buffer = buffer;
    }

    decode(): Descriptor {
        throw new Error("Not implemented");
    }

    encode() {
        throw new Error("Not implemented");
    }

    getBuffer(): Buffer {
        return this._buffer;
    }

    getDescriptorTag(): number {
        return this._buffer[0];
    }

    getDescriptorLength(): number {
        return this._buffer[1];
    }
}
