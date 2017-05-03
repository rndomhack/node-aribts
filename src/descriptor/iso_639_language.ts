import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface Iso639Language extends Descriptor {
    ISO_639_languages: LanguageItem[];
}

export interface LanguageItem {
    ISO_639_language_code: Buffer;
    audio_type: number;
}

export default class TsDescriptorIso639Language extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): Iso639Language {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as Iso639Language;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.ISO_639_languages = [];

        for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
            const ISO_639_language = {} as any as LanguageItem;

            ISO_639_language.ISO_639_language_code = reader.readBytes(3);
            ISO_639_language.audio_type = reader.bslbf(8);

            objDescriptor.ISO_639_languages.push(ISO_639_language);
        }

        return objDescriptor;
    }
}
