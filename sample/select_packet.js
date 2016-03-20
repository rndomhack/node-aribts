"use strict";

const fs = require("fs");
const aribts = require("../index");
const TsStream = aribts.TsStream;

const readStream = fs.createReadStream(process.argv[2]);
const writeStream = fs.createWriteStream(process.argv[3]);
const tsStream = new TsStream({
    transform: true,
    transPmtIds: [0],
    transPmtPids: [],
    transPids: new Array(0x32).fill(0x00).map((value, index) => index)
});

readStream.pipe(tsStream);
tsStream.pipe(writeStream);

tsStream.on("info", data => {
    console.log("");
    console.log("info:");
    Object.keys(data).forEach(key => {
        console.log(`0x${("000" + parseInt(key, 10).toString(16)).slice(-4)}: packet: ${data[key].packet}, drop: ${data[key].drop}, scrambling: ${data[key].scrambling}`);
    });
});
