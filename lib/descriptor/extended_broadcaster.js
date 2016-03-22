"use strict";

const TsReader = require("../reader");

class TsDescriptorExtendedBroadcaster {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let reader = new TsReader(this.buffer);
        let objDescriptor = {};

        objDescriptor._raw = this.buffer;

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
                let objAffiliation = {};

                objAffiliation.affiliation_id = reader.uimsbf(8);

                objDescriptor.affiliations.push(objAffiliation);
            }

            for (let i = 0; i < objDescriptor.number_of_broadcaster_id_loop; i++) {
                let objBroadcaster = {};

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
                let objSoundBroadcastAffiliation = {};

                objSoundBroadcastAffiliation.sound_broadcast_affiliation_id = reader.uimsbf(8);

                objDescriptor.sound_broadcast_affiliations.push(objSoundBroadcastAffiliation);
            }

            for (let i = 0; i < objDescriptor.number_of_broadcaster_id_loop; i++) {
                let objBroadcaster = {};

                objBroadcaster.original_network_id = reader.uimsbf(16);
                objBroadcaster.broadcaster_id = reader.uimsbf(8);

                objDescriptor.broadcasters.push(objBroadcaster);
            }
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorExtendedBroadcaster;
