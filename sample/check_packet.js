"use strict";

const fs = require("fs");
const stream = require("stream");
const aribts = require("../index");

if (process.argv.length < 3) {
    console.error("Usage: node check_drop.js /path/to/file.ts");
    process.exit(1);
}

const size = process.argv[2] === "-" ? 0 : fs.statSync(process.argv[2]).size;
let bytesRead = 0;
let time = null;

const readableStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const transformStream = new stream.Transform({
    transform: function (chunk, encoding, done) {
        bytesRead += chunk.length;

        process.stderr.write("\r\u001b[K");
        process.stderr.write(`Check - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

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
const tsPacketParser = new aribts.TsPacketParser();
const tsPacketAnalyzer = new aribts.TsPacketAnalyzer();
const tsSectionParser = new aribts.TsSectionParser();
const tsSectionAnalyzer = new aribts.TsSectionAnalyzer();

tsPacketAnalyzer.on("packetError", (pid, counter, expected) => {
    process.stderr.write("\r\u001b[K");
    console.error(`error (pid: 0x${("000" + pid.toString(16)).slice(-4)}, counter: ${counter}, expected: ${expected}, time: ${time === null ? "" : time.getTime()})`);
});

tsPacketAnalyzer.on("packetDrop", (pid, counter, expected) => {
    process.stderr.write("\r\u001b[K");
    console.error(`drop (pid: 0x${("000" + pid.toString(16)).slice(-4)}, counter: ${counter}, expected: ${expected}, time: ${time === null ? "" : time.getTime()})`);
});

tsPacketAnalyzer.on("finish", () => {
    const result = tsPacketAnalyzer.getResult();

    console.error("\n\ninfo:");

    for (const key of Object.keys(result)) {
        console.error(`0x${("000" + parseInt(key, 10).toString(16)).slice(-4)}: packet: ${result[key].packet}, error: ${result[key].error}, drop: ${result[key].drop}, scrambling: ${result[key].scrambling}`);
    }
});

tsSectionAnalyzer.on("time", _time => {
    time = _time;
});

readableStream.pipe(transformStream);
transformStream.pipe(tsReadableConnector);

tsReadableConnector.pipe(tsPacketParser);
tsPacketParser.pipe(tsPacketAnalyzer);
tsPacketParser.pipe(tsSectionParser);
tsSectionParser.pipe(tsSectionAnalyzer);
