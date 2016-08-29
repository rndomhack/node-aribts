"use strict";

const fs = require("fs");
const stream = require("stream");
const aribts = require("../index");
const TsStream = aribts.TsStream;

if (process.argv < 4) {
    console.error("Usage: node get_present_following.js /path/to/infile.ts /path/to/outfile.ts");
    process.exit(1);
}

let size = process.argv[2] === "-" ? 0 : fs.statSync(process.argv[2]).size;
let bytesRead = 0;

const readStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const writeStream = process.argv[3] === "-" ? process.stdout : fs.createWriteStream(process.argv[3]);
const transformStream = new stream.Transform({
    transform: function (chunk, encoding, done) {
        bytesRead += chunk.length;

        console.error("\u001b[2A");
        console.error(`Transform - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        this.push(chunk);
        done();
    },
    flush: function (done) {
        console.error("\u001b[2A");
        console.error(`Done - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        done();
    }
});
const tsStream = new TsStream({
    transform: true,
    transPmtIds: [0],
    transPmtPids: [],
    transPmtSids: [],
    transPids: new Array(0x32).fill(0x00).map((value, index) => index)
});

readStream.pipe(transformStream);
transformStream.pipe(tsStream);
tsStream.pipe(writeStream);

tsStream.on("info", data => {
    console.error("");
    console.error("info:");
    Object.keys(data).forEach(key => {
        console.error(`0x${("000" + parseInt(key, 10).toString(16)).slice(-4)}: packet: ${data[key].packet}, drop: ${data[key].drop}, scrambling: ${data[key].scrambling}`);
    });
});
