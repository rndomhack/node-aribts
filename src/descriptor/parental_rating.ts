import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ParentalRating extends Descriptor {
    parental_ratings: Rating[];
}

export interface Rating {
    country_code: Buffer;
    rating: number;
}

export default class TsDescriptorParentalRating extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ParentalRating {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ParentalRating;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.parental_ratings = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const parental_rating = {} as any as Rating;

            parental_rating.country_code = reader.readBytes(3);
            parental_rating.rating = reader.uimsbf(8);

            objDescriptor.parental_ratings.push(parental_rating);
        }

        return objDescriptor;
    }
}
