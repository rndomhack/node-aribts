import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface BoardInformation extends Descriptor {
    title_length: number;
    title: Buffer;
    text_length: number;
    text: Buffer;
}

export default class TsDescriptorBoardInformation extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): BoardInformation {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as BoardInformation;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.title_length = reader.uimsbf(8);
        objDescriptor.title = reader.readBytes(objDescriptor.title_length);
        objDescriptor.text_length = reader.uimsbf(8);
        objDescriptor.text = reader.readBytes(objDescriptor.text_length);

        return objDescriptor;
    }
}
