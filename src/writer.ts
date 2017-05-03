export default class TsWriter {
    buffer: Buffer;
    position: number;

    constructor(buffer: Buffer, position?: number) {
        this.buffer = buffer;
        this.position = position || 0;
    }

    writeBits(length: number, value: number): void {
        if (this.position + length > this.buffer.length << 3) {
            this.position += length;
            return;
        }

        while (length > 0) {
            const index = this.position >> 3;
            const shift = this.position & 0x07 ^ 0x07;

            this.buffer[index] = (this.buffer[index] & ~(1 << shift)) | ((value >> (length - 1) & 0x01) << shift);

            this.position++;
            length--;
        }
    }

    writeBytes(length: number, value: Buffer): void {
        if (this.position + (length << 3) > this.buffer.length << 3) {
            this.position += length << 3;
            return;
        }

        const start = this.position >> 3;

        this.position += length << 3;

        value.copy(this.buffer, start, 0, length);
    }

    next(length: number): void {
        this.position += length;
    }

    previous(length: number): void {
        this.position -= length;
    }

    bslbf(length: number, value: number): void {
        this.writeBits(length, value);
    }

    uimsbf(length: number, value: number): void {
        this.writeBits(length, value);
    }

    tcimsbf(length: number, value: number): void {
        this.writeBits(length, value >>> 31 << length - 1 | value & (1 << length - 1) - 1);
    }

    rpchof(length: number, value: number): void {
        this.writeBits(length, value);
    }
}
