"use strict";

const fs = require("fs");
const stream = require("stream");
const aribts = require("../index");
const TsStream = aribts.TsStream;
const TsUtil = aribts.TsUtil;

let size = process.argv[2] === "-" ? 0 : fs.statSync(process.argv[2]).size;
let bytesRead = 0;

const readStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const transformStream = new stream.Transform({
    transform: function (chunk, encoding, done) {
        bytesRead += chunk.length;

        console.error("\u001b[2A");
        console.error(`Check - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        this.push(chunk);
        done();
    },
    flush: function (done) {
        console.error("\u001b[2A");
        console.error(`Done - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        done();
    }
});
const tsStream = new TsStream();

const tsUtil = new TsUtil();

readStream.pipe(transformStream);
transformStream.pipe(tsStream);

tsStream.on("data", () => {
    // nothing
});

tsStream.on("drop", (pid, counter, expected) => {
    let time = tsUtil.isTime() ? `${("0" + tsUtil.getTime().getHours()).slice(-2)}:${("0" + tsUtil.getTime().getMinutes()).slice(-2)}:${("0" + tsUtil.getTime().getSeconds()).slice(-2)}` : "unknown";

    console.error(`pid: 0x${("000" + pid.toString(16)).slice(-4)}, counter: ${counter}, expected: ${expected}, time: ${time}`);
    console.error("");
});

tsStream.on("info", data => {
    console.error("");
    console.error("info:");
    Object.keys(data).forEach(key => {
        console.error(`0x${("000" + parseInt(key, 10).toString(16)).slice(-4)}: packet: ${data[key].packet}, drop: ${data[key].drop}, scrambling: ${data[key].scrambling}`);
    });
});

tsStream.on("tdt", (pid, data) => {
    tsUtil.addTdt(pid, data);
});

tsStream.on("tot", (pid, data) => {
    tsUtil.addTot(pid, data);
});

