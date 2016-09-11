"use strict";

const fs = require("fs");
const stream = require("stream");
const aribts = require("../index");

if (process.argv.length < 5) {
    console.error("Usage: node select_packet.js /path/to/infile.ts /path/to/outfile.ts programNumber1 programNumber2 ...");
    process.exit(1);
}

const size = process.argv[2] === "-" ? 0 : fs.statSync(process.argv[2]).size;
let bytesRead = 0;

const readableStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const writableStream = process.argv[3] === "-" ? process.stdout : fs.createWriteStream(process.argv[3]);
const transformStream = new stream.Transform({
    transform: function (chunk, encoding, done) {
        bytesRead += chunk.length;

        process.stderr.write("\r\u001b[K");
        process.stderr.write(`Transform - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        this.push(chunk);
        done();
    },
    flush: function (done) {
        process.stderr.write("\r\u001b[K");
        process.stderr.write(`Done - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        done();
    }
});

const tsReadableConnector = new aribts.TsReadableConnector();
const tsWritableConnector = new aribts.TsWritableConnector();
const tsPacketParser = new aribts.TsPacketParser();
const tsPacketConverter = new aribts.TsPacketConverter();
const tsPacketAnalyzer = new aribts.TsPacketAnalyzer();
const tsPacketSelector = new aribts.TsPacketSelector({
    pids: new Array(0x30).fill(0).map((_, index) => index),
    programNumbers: process.argv.slice(4).map(str => Number.parseInt(str, 10))
});
const tsSectionParser = new aribts.TsSectionParser();

readableStream.pipe(transformStream);
transformStream.pipe(tsReadableConnector);
tsWritableConnector.pipe(writableStream);

tsSectionParser.on("pat", tsPacketSelector.onPat.bind(tsPacketSelector));
tsSectionParser.on("cat", tsPacketSelector.onCat.bind(tsPacketSelector));
tsSectionParser.on("pmt", tsPacketSelector.onPmt.bind(tsPacketSelector));

tsReadableConnector.pipe(tsPacketParser);
tsPacketParser.pipe(tsPacketAnalyzer);
tsPacketParser.pipe(tsSectionParser);
tsPacketParser.pipe(tsPacketSelector);
tsPacketSelector.pipe(tsPacketConverter);
tsPacketConverter.pipe(tsWritableConnector);
