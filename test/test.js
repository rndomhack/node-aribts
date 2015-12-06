"use strict";

const fs = require("fs");
const util = require("util");
const aribts = require("../index");
const TsStream = aribts.TsStream;

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

tsStream.on("info", data => {
    console.log("info", data);
});

tsStream.on("drop", pid => {
    //console.log("drop", pid);
});

tsStream.on("scrambling", pid => {
    //console.log("scrambling", pid);
});

tsStream.on("pat", (pid, data) => {
    //console.log("pat", pid, util.inspect(data, {depth: null}));
});

tsStream.on("cat", (pid, data) => {
    //console.log("cat", pid, util.inspect(data, {depth: null}));
});

tsStream.on("pmt", (pid, data) => {
    //console.log("pmt", pid, util.inspect(data, {depth: null}));
});

tsStream.on("nit", (pid, data) => {
    //console.log("nit", pid, util.inspect(data, {depth: null}));
});

tsStream.on("sdt", (pid, data) => {
    //console.log("sdt", pid, util.inspect(data, {depth: null}));
});

tsStream.on("bat", (pid, data) => {
    //console.log("bat", pid, util.inspect(data, {depth: null}));
});

tsStream.on("eit", (pid, data) => {
    //console.log("eit", pid, util.inspect(data, {depth: null}));
});

tsStream.on("tdt", (pid, data) => {
    //console.log("tdt", pid, util.inspect(data, {depth: null}));
});

tsStream.on("tot", (pid, data) => {
    //console.log("tot", pid, util.inspect(data, {depth: null}));
});

tsStream.on("end", () => {
    console.log(count, loadSize / fileSize * 100);
    console.timeEnd("load");
});
