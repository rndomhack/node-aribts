"use strict";

const fs = require("fs");
const stream = require("stream");
const aribts = require("../index");
const TsStream = aribts.TsStream;

var size = fs.statSync(process.argv[2]).size;
var bytesRead = 0;

const readStream = fs.createReadStream(process.argv[2]);
const writeStream = fs.createWriteStream(process.argv[3]);
const transformStream = new stream.Transform({
    transform: function (chunk, encoding, done) {
        bytesRead += chunk.length;

        console.log("\u001b[2A");
        console.log(`Transform - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        this.push(chunk);
        done();
    },
    flush: function (done) {
        done();
    }
});
const tsStream = new TsStream({
    transform: true,
    transPmtIds: [0],
    transPmtPids: [],
    transPids: new Array(0x32).fill(0x00).map((value, index) => index)
});

readStream.pipe(transformStream);
transformStream.pipe(tsStream);
tsStream.pipe(writeStream);

tsStream.on("info", data => {
    console.log("");
    console.log("info:");
    Object.keys(data).forEach(key => {
        console.log(`0x${("000" + parseInt(key, 10).toString(16)).slice(-4)}: packet: ${data[key].packet}, drop: ${data[key].drop}, scrambling: ${data[key].scrambling}`);
    });
});
