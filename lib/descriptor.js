"use strict";

class TsDescriptorParser {
    constructor() {

    }

    parse(buffer) {
        var objDescriptor = {};
        var bytesRead = 0;

        objDescriptor.descriptorTag = buffer[bytesRead++];
        objDescriptor.descriptorLength = buffer[bytesRead++];
        objDescriptor.descriptor = buffer.slice(bytesRead, bytesRead + objDescriptor.descriptorLength);
        bytesRead += objDescriptor.descriptorLength;

        return objDescriptor;
    }

    parseMulti(buffer) {
        var arrDescriptor = [];

        for (let i = 0; i < buffer.length; ) {
            let descriptorLength = buffer[i + 1];

            arrDescriptor.push(this.parse(buffer.slice(i, i + 2 + descriptorLength)));

            i += 2 + descriptorLength;
        }

        return arrDescriptor;
    }

}

module.exports = TsDescriptorParser;
