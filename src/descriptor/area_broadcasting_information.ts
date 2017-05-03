import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface AreaBroadcastingInformation extends Descriptor {
    num_of_station_point: number;
    station_points: StationPoint[];
}

export interface StationPoint {
    station_id: number;
    location_code: number;
    broadcast_signal_format: number;
    additional_station_info_length: number;
    additional_station_info: Buffer;
}

export default class TsDescriptorAreaBroadcastingInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): AreaBroadcastingInformation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as AreaBroadcastingInformation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.num_of_station_point = reader.uimsbf(8);
        objDescriptor.station_points = [];

        for (let i = 0; i < objDescriptor.num_of_station_point; i++) {
            const station_point = {} as any as StationPoint;

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
