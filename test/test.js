"use strict";

const fs = require("fs");
const TsStream = require("../lib/stream");

const readStream = fs.createReadStream(process.argv[2]);
const tsStream = new TsStream();

var fileSize = fs.statSync(process.argv[2]).size;
var loadSize = 0;
var count = 0;

console.time("load");

readStream.pipe(tsStream);

tsStream.on("data", data => {
    loadSize += data.length;
    if (++count % 100000 === 0) console.log(count, loadSize / fileSize * 100);
});

tsStream.on("drop", (pid, data) => {
    console.log("drop", pid, data);
});

tsStream.on("pat", (pid, data) => {
    //console.log("pat", pid, data);
});

tsStream.on("pmt", (pid, data) => {
    //console.log("pmt", pid, data);
});

/*
tsStream.on("packet", packet => {
    loadSize += packet.raw.length;
    if (packet.PID === 0x140 && packet.adaptation_field_control >> 1 === 1) {
        //console.log(packet);
    }
    if (++count % 100000 === 0) {
        console.log(count, loadSize / fileSize * 100);
    }
});
*/

tsStream.on("end", () => {
    console.log(count, loadSize / fileSize * 100);
    console.timeEnd("load");
});
