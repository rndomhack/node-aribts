"use strict";

const fs = require("fs");
const aribts = require("../index");
const TsStream = aribts.TsStream;
const TsUtil = aribts.TsUtil;

const readStream = fs.createReadStream(process.argv[2]);
const tsStream = new TsStream();

const tsUtil = new TsUtil();

readStream.pipe(tsStream);

tsStream.on("data", () => {});

tsStream.on("drop", pid => {
    var time = tsUtil.isTime() ? `${("0" + tsUtil.getTime().getHours()).slice(-2)}:${("0" + tsUtil.getTime().getMinutes()).slice(-2)}:${("0" + tsUtil.getTime().getSeconds()).slice(-2)}` : "unknown";
    console.log(`pid: 0x${("000" + pid.toString(16)).slice(-4)}, time: ${tsUtil.isTime() ? time : "unknown"}`);
});

tsStream.on("info", data => {
    console.log("");
    console.log("info:");
    Object.keys(data).forEach(key => {
        console.log(`0x${("000" + parseInt(key, 10).toString(16)).slice(-4)}: packet: ${data[key].packet}, drop: ${data[key].drop}, scrambling: ${data[key].scrambling}`);
    });
});

tsStream.on("tdt", (pid, data) => {
    tsUtil.addTdt(pid, data);
});

tsStream.on("tot", (pid, data) => {
    tsUtil.addTot(pid, data);
});
