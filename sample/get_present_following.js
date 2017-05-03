"use strict";

const fs = require("fs");
const aribts = require("../lib/index");

if (process.argv.length < 3) {
    console.error("Usage: node get_present_following.js /path/to/file.ts");
    process.exit(1);
}

const readableStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);

const tsReadableConnector = new aribts.TsReadableConnector();
const tsPacketParser = new aribts.TsPacketParser();
const tsSectionParser = new aribts.TsSectionParser();
const tsEventManager = new aribts.TsEventManager();

tsEventManager.on("present", tsEvent => {
    const info = tsEvent.getInfo();
    const shortEvent = tsEvent.getShortEvent();

    console.error(`present (onid: ${info.originalNetworkId}, tsid: ${info.transportStreamId}, sid: ${info.serviceId})`);
    console.error(`eventId: ${info.eventId}`);
    console.error(`startTime: ${info.startTime}`);
    console.error(`duration: ${info.duration}`);
    console.error(`runningStatus: ${info.runningStatus}`);
    console.error(`freeCaMode: ${info.freeCaMode}`);
    console.error(`eventName: ${shortEvent !== null ? shortEvent.eventName : ""}`);
    console.error(`text: ${shortEvent !== null ? shortEvent.text : ""}\n`);
});

tsEventManager.on("following", tsEvent => {
    const info = tsEvent.getInfo();
    const shortEvent = tsEvent.getShortEvent();

    console.error(`following (onid: ${info.originalNetworkId}, tsid: ${info.transportStreamId}, sid: ${info.serviceId})`);
    console.error(`eventId: ${info.eventId}`);
    console.error(`startTime: ${info.startTime}`);
    console.error(`duration: ${info.duration}`);
    console.error(`runningStatus: ${info.runningStatus}`);
    console.error(`freeCaMode: ${info.freeCaMode}`);
    console.error(`eventName: ${shortEvent !== null ? shortEvent.eventName : ""}`);
    console.error(`text: ${shortEvent !== null ? shortEvent.text : ""}\n`);
});

readableStream.pipe(tsReadableConnector);

tsReadableConnector.pipe(tsPacketParser);
tsPacketParser.pipe(tsSectionParser);
tsSectionParser.pipe(tsEventManager);
