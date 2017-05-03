export interface Section {
    table_id: number;
    section_syntax_indicator: number;
    section_length: number;
    transport_stream_id: number;
    version_number: number;
    current_next_indicator: number;
    section_number: number;
    last_section_number: number;

    CRC_32: Buffer;
}

export default class TsSectionBase {
    _buffer: Buffer;
    _pid: number;

    constructor(buffer: Buffer, pid: number) {
        this._buffer = buffer;
        this._pid = pid;
    }

    decode(): Section {
        throw new Error("Not implemented");
    }

    encode(section: Section): void {
        throw new Error("Not implemented");
    }

    getBuffer(): Buffer {
        return this._buffer;
    }

    getPacketDataBuffer(): Buffer {
        return Buffer.concat([Buffer.alloc(1), this._buffer]);
    }

    getPid(): number {
        return this._pid;
    }

    getTableId(): number {
        return this._buffer[0];
    }

    getSectionSyntaxIndicator(): number {
        return this._buffer[1] >> 7;
    }

    getPrivateIndicator(): number {
        return (this._buffer[1] & 0x40) >> 6;
    }

    getSectionLength(): number {
        return (this._buffer[1] & 0x0F) << 8 | this._buffer[2];
    }
}
