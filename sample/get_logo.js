"use strict";

const fs = require("fs");
const path = require("path");
const aribts = require("../lib/index");

if (process.argv.length < 4) {
    console.error("Usage: node get_logo.js /path/to/file.ts /path/to/folder");
    process.exit(1);
}

const readableStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);

const tsReadableConnector = new aribts.TsReadableConnector();
const tsPacketParser = new aribts.TsPacketParser();
const tsSectionParser = new aribts.TsSectionParser();
const tsCommonDataManager = new aribts.TsCommonDataManager();

tsCommonDataManager.on("logo", (logo, onid, logoId, logoType) => {
    console.error(`logo (onid: ${onid}, logoId: ${logoId}, logoType: ${logoType})`);

    let promise = saveFile(path.join(process.argv[3], `${onid}-${logoId}-${logoType}.png`), logo);

    promise = promise.catch(err => {
        console.error(`Error: ${err.message}`);
    });
});

tsCommonDataManager.on("simpleLogo", (logo, onid, tsid, sid) => {
    console.error(`simpleLogo (onid: ${onid}, tsid: ${tsid}, sid: ${sid})`);

    let promise = saveFile(path.join(process.argv[3], `${onid}-${tsid}-${sid}.txt`), logo);

    promise = promise.catch(err => {
        console.error(`Error: ${err.message}`);
    });
});

function saveFile(file, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, err => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

readableStream.pipe(tsReadableConnector);

tsReadableConnector.pipe(tsPacketParser);
tsPacketParser.pipe(tsSectionParser);
tsSectionParser.pipe(tsCommonDataManager);
