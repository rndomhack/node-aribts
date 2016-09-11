"use strict";

class TsDate {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        const date = this.decodeDate();
        const time = this.decodeTime();

        return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
    }

    decodeDate() {
        const buffer = this.buffer.length === 2 ? this.buffer : this.buffer.slice(0, 2);

        const mjd = (buffer[0] << 8) | buffer[1];

        let year = (((mjd - 15078.2) / 365.25) | 0);
        let month = (((mjd - 14956.1 - ((year * 365.25) | 0)) / 30.6001) | 0);
        const day = mjd - 14956 - ((year * 365.25) | 0) - ((month * 30.6001) | 0);

        const k = (month === 14 || month === 15) ? 1 : 0;

        year = year + k + 1900;
        month = month - 1 - k * 12;

        return [year, month, day];
    }

    decodeTime() {
        const buffer = this.buffer.length === 3 ? this.buffer : this.buffer.slice(2);

        const hour = (buffer[0] >> 4) * 10 + (buffer[0] & 0x0F);
        const minite = (buffer[1] >> 4) * 10 + (buffer[1] & 0x0F);
        const second = (buffer[2] >> 4) * 10 + (buffer[2] & 0x0F);

        return [hour, minite, second];
    }

    decodeOffset() {
        const hour = (this.buffer[0] >> 4) * 10 + (this.buffer[0] & 0x0F);
        const minite = (this.buffer[1] >> 4) * 10 + (this.buffer[1] & 0x0F);

        return [hour, minite];
    }

    decodeTimeInSeconds() {
        const time = this.decodeTime();

        return time[0] * 3600 + time[1] * 60 + time[2];
    }

    decodeOffsetInMinutes() {
        const time = this.decodeOffset();

        return time[0] * 60 + time[1];
    }

    getBuffer() {
        return this.buffer;
    }
}

module.exports = TsDate;
