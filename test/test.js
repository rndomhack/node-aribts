"use strict";

const fs = require("fs");
const stream = require("stream");
const util = require("util");
const aribts = require("../index");
const TsStream = aribts.TsStream;
const TsUtil = aribts.TsUtil;

let size = process.argv[2] === "-" ? 0 : fs.statSync(process.argv[2]).size;
let bytesRead = 0;

const readStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const transformStream = new stream.Transform({
    transform: function (chunk, encoding, done) {
        bytesRead += chunk.length;

        console.log("\u001b[2A");
        console.log(`Load - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        this.push(chunk);
        done();
    },
    flush: function (done) {
        console.log("\u001b[2A");
        console.log(`Done - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);
        console.timeEnd("load");

        done();
    }
});
const tsStream = new TsStream({
    packetSize: 188,
    transform: false,
    transPmtIds: [],
    transPmtPids: [],
    transPmtSids: [],
    transPids: []
});
const tsUtil = new TsUtil();

console.time("load");

readStream.pipe(transformStream);
transformStream.pipe(tsStream);
tsStream.on("data", data => {});

tsStream.on("info", data => {
    console.log("info", data);
});

tsStream.on("drop", pid => {
    //console.log("drop", pid);
});

tsStream.on("scrambling", pid => {
    //console.log("scrambling", pid);
});

/*
tsStream.on("packet", (pid, data) => {
    //console.log("packet", pid, util.inspect(data, {depth: null}));
});
*/

tsStream.on("pat", (pid, data) => {
    //tsUtil.addPat(pid, data);
    //console.log("pat", pid, util.inspect(data, {depth: null}));
});

tsStream.on("cat", (pid, data) => {
    //tsUtil.addCat(pid, data);
    //console.log("cat", pid, util.inspect(data, {depth: null}));
});

tsStream.on("pmt", (pid, data) => {
    //tsUtil.addPmt(pid, data);
    //console.log("pmt", pid, util.inspect(data, {depth: null}));
});

tsStream.on("nit", (pid, data) => {
    //tsUtil.addNit(pid, data);
    //console.log("nit", pid, util.inspect(data, {depth: null}));
});

tsStream.on("sdt", (pid, data) => {
    //tsUtil.addSdt(pid, data);
    //console.log("sdt", pid, util.inspect(data, {depth: null}));
});

tsStream.on("bat", (pid, data) => {
    //tsUtil.addBat(pid, data);
    //console.log("bat", pid, util.inspect(data, {depth: null}));
});

tsStream.on("eit", (pid, data) => {
    //tsUtil.addEit(pid, data);
    //console.log("eit", pid, util.inspect(data, {depth: null}));
});

tsStream.on("tdt", (pid, data) => {
    //tsUtil.addTdt(pid, data);
    //console.log("tdt", pid, util.inspect(data, {depth: null}));
});

tsStream.on("tot", (pid, data) => {
    //tsUtil.addTot(pid, data);
    //console.log("tot", pid, util.inspect(data, {depth: null}));
});

tsStream.on("dit", (pid, data) => {
    //console.log("dit", pid, util.inspect(data, {depth: null}));
});

tsStream.on("sit", (pid, data) => {
    //console.log("sit", pid, util.inspect(data, {depth: null}));
});
