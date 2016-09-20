"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorAreaBroadcastingInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.num_of_station_point = reader.uimsbf(8);
        objDescriptor.station_points = [];

        for (let i = 0; i < objDescriptor.num_of_station_point; i++) {
            const station_point = {};

            station_point.station_id = reader.uimsbf(24);
            station_point.location_code = reader.uimsbf(16);
            station_point.broadcast_signal_format = reader.uimsbf(8);
            station_point.additional_station_info_length = reader.uimsbf(8);
            station_point.additional_station_info = reader.readBytes(station_point.additional_station_info_length);

            objDescriptor.station_points.push(station_point);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorAreaBroadcastingInformation;
