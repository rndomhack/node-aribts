"use strict";

const fs = require("fs");
const util = require("util");
const stream = require("stream");
const aribts = require("../index");

const startTime = Date.now();
const size = process.argv[2] === "-" ? 0 : fs.statSync(process.argv[2]).size;
let bytesRead = 0;

const readableStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const transformStream = new stream.Transform({
    transform: function (chunk, encoding, done) {
        bytesRead += chunk.length;

        process.stderr.write("\r\u001b[K");
        process.stderr.write(`Load - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        this.push(chunk);
        done();
    },
    flush: function (done) {
        process.stderr.write("\r\u001b[K");
        process.stderr.write(`Done - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]\n`);
        process.stderr.write(`time: ${(Date.now() - startTime) / 1000} s`);

        done();
    }
});

const tsReadableConnector = new aribts.TsReadableConnector();
const tsPacketParser = new aribts.TsPacketParser();
const tsPacketAnalyzer = new aribts.TsPacketAnalyzer();
const tsSectionParser = new aribts.TsSectionParser();
const tsSectionUpdater = new aribts.TsSectionUpdater();
const tsSectionAnalyzer = new aribts.TsSectionAnalyzer();

tsPacketAnalyzer.on("packetDrop", pid => {
    //process.stderr.write("\r\u001b[K");
    //console.error("drop", pid);
});

tsPacketAnalyzer.on("packetScrambling", pid => {
    //process.stderr.write("\r\u001b[K");
    //console.error("scrambling", pid);
});

tsSectionUpdater.on("pat", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("pat", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("cat", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("cat", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("pmt", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("pmt", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("dsmcc", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("dsmcc", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("nit", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("nit", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("sdt", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("sdt", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("bat", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("bat", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("eit", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("eit", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("tdt", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("tdt", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("tot", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("tot", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("dit", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("dit", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("sit", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("sit", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("ecm", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("ecm", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("emm", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("emm", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("emmm", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("emmm", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("sdtt", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("sdtt", util.inspect(tsSection.decode(), {depth: null}));
});

tsSectionUpdater.on("cdt", tsSection => {
    //process.stderr.write("\r\u001b[K");
    //console.error("cdt", util.inspect(tsSection.decode(), {depth: null}));
});

readableStream.pipe(transformStream);
transformStream.pipe(tsReadableConnector);

tsReadableConnector.pipe(tsPacketParser);
tsPacketParser.pipe(tsPacketAnalyzer);
tsPacketParser.pipe(tsSectionParser);
tsSectionParser.pipe(tsSectionUpdater);
tsSectionParser.pipe(tsSectionAnalyzer);
