"use strict";

class TsDate {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var mjd, k, year, month, day, hour, minite, second;

        mjd = (this.buffer[0] << 8) | this.buffer[1];

        year = (((mjd - 15078.2) / 365.25) | 0);
        month = (((mjd - 14956.1 - ((year * 365.25) | 0)) / 30.6001) | 0);
        day = mjd - 14956 - ((year * 365.25) | 0) - ((month * 30.6001) | 0);

        k = (month === 14 || month === 15) ? 1 : 0;

        year = year + k + 1900;
        month = month - 1 - k * 12;

        hour = (this.buffer[2] >> 4) * 10 + (this.buffer[2] & 0x0F);
        minite = (this.buffer[3] >> 4) * 10 + (this.buffer[3] & 0x0F);
        second = (this.buffer[4] >> 4) * 10 + (this.buffer[4] & 0x0F);

        return new Date(year, month - 1, day, hour, minite, second);
    }

    decodeTime() {
        var buffer = this.buffer.length === 3 ? this.buffer : this.buffer.slice(2);
        var hour, minite, second;

        hour = (buffer[0] >> 4) * 10 + (buffer[0] & 0x0F);
        minite = (buffer[1] >> 4) * 10 + (buffer[1] & 0x0F);
        second = (buffer[2] >> 4) * 10 + (buffer[2] & 0x0F);

        return new Date(2000, 0, 1, hour, minite, second);
    }
}

module.exports = TsDate;
