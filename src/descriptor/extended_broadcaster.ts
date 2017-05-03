import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ExtendedBroadcaster extends Descriptor {
    broadcaster_type: number;
    terrestrial_broadcaster_id?: number;
    terrestrial_sound_broadcaster_id?: number;
    number_of_affiliation_id_loop?: number;
    number_of_sound_broadcast_affiliation_id_loop?: number;
    number_of_broadcaster_id_loop?: number;
    affiliations?: Affiliation[];
    sound_broadcast_affiliations?: SoundBroadcastAffiliation[];
    broadcasters?: Broadcaster[];
}

export interface Affiliation {
    affiliation_id: number;
}

export interface SoundBroadcastAffiliation {
    sound_broadcast_affiliation_id: number;
}

export interface Broadcaster {
    original_network_id: number;
    broadcaster_id: number;
}

export default class TsDescriptorExtendedBroadcaster extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ExtendedBroadcaster {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ExtendedBroadcaster;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.broadcaster_type = reader.uimsbf(4);
        reader.next(4);    // reserved_future_use

        if (objDescriptor.broadcaster_type === 1) {
            objDescriptor.terrestrial_broadcaster_id = reader.uimsbf(16);
            objDescriptor.number_of_affiliation_id_loop = reader.uimsbf(4);
            objDescriptor.number_of_broadcaster_id_loop = reader.uimsbf(4);
            objDescriptor.affiliations = [];
            objDescriptor.broadcasters = [];

            for (let i = 0; i < objDescriptor.number_of_affiliation_id_loop; i++) {
                const objAffiliation = {} as any as Affiliation;

                objAffiliation.affiliation_id = reader.uimsbf(8);

                objDescriptor.affiliations.push(objAffiliation);
            }

            for (let i = 0; i < objDescriptor.number_of_broadcaster_id_loop; i++) {
                const objBroadcaster = {} as any as Broadcaster;

                objBroadcaster.original_network_id = reader.uimsbf(16);
                objBroadcaster.broadcaster_id = reader.uimsbf(8);

                objDescriptor.broadcasters.push(objBroadcaster);
            }
        } else if (objDescriptor.broadcaster_type === 2) {
            objDescriptor.terrestrial_sound_broadcaster_id = reader.uimsbf(16);
            objDescriptor.number_of_sound_broadcast_affiliation_id_loop = reader.uimsbf(4);
            objDescriptor.number_of_broadcaster_id_loop = reader.uimsbf(4);
            objDescriptor.sound_broadcast_affiliations = [];
            objDescriptor.broadcasters = [];

            for (let i = 0; i < objDescriptor.number_of_affiliation_id_loop; i++) {
                const objSoundBroadcastAffiliation = {} as any as SoundBroadcastAffiliation;

                objSoundBroadcastAffiliation.sound_broadcast_affiliation_id = reader.uimsbf(8);

                objDescriptor.sound_broadcast_affiliations.push(objSoundBroadcastAffiliation);
            }

            for (let i = 0; i < objDescriptor.number_of_broadcaster_id_loop; i++) {
                const objBroadcaster = {} as any as Broadcaster;

                objBroadcaster.original_network_id = reader.uimsbf(16);
                objBroadcaster.broadcaster_id = reader.uimsbf(8);

                objDescriptor.broadcasters.push(objBroadcaster);
            }
        }

        return objDescriptor;
    }
}
