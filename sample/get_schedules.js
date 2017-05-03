"use strict";

const fs = require("fs");
const aribts = require("../lib/index");

if (process.argv.length < 3) {
    console.error("Usage: node get_schedules.js /path/to/file.ts");
    process.exit(1);
}

const readableStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);

const tsReadableConnector = new aribts.TsReadableConnector();
const tsPacketParser = new aribts.TsPacketParser();
const tsSectionParser = new aribts.TsSectionParser();
const tsEventManager = new aribts.TsEventManager();

tsEventManager.on("update", tableId => {
    if (tableId === 0x4E || tableId === 0x4F) return;

    const amount = tsEventManager.getSchedulesAmount();

    console.error("\u001b[2A");
    console.error(`Check - ${amount[0]} of ${amount[1]} [${Math.floor(amount[0] / amount[1] * 100)}%]`);

    if (!tsEventManager.hasSchedules()) return;

    const schedules = tsEventManager.getSchedules();

    for (const onid of Object.keys(schedules)) {
        const originalNetwork = schedules[onid];

        for (const tsid of Object.keys(originalNetwork)) {
            const transportStream = originalNetwork[tsid];

            for (const sid of Object.keys(transportStream)) {
                const service = transportStream[sid];

                for (const eid of Object.keys(service)) {
                    const _event = service[eid];

                    const info = _event.getInfo();
                    const shortEvent = _event.getShortEvent();

                    console.error(`schedule (onid: ${info.originalNetworkId}, tsid: ${info.transportStreamId}, sid: ${info.serviceId})`);
                    console.error(`eventId: ${info.eventId}`);
                    console.error(`startTime: ${info.startTime}`);
                    console.error(`duration: ${info.duration}`);
                    console.error(`runningStatus: ${info.runningStatus}`);
                    console.error(`freeCaMode: ${info.freeCaMode}`);
                    console.error(`eventName: ${shortEvent !== null ? shortEvent.eventName : ""}`);
                    console.error(`text: ${shortEvent !== null ? shortEvent.text : ""}\n`);
                }
            }
        }
    }

    readableStream.unpipe(tsReadableConnector);
    tsReadableConnector.end();
});

readableStream.pipe(tsReadableConnector);

tsReadableConnector.pipe(tsPacketParser);
tsPacketParser.pipe(tsSectionParser);
tsSectionParser.pipe(tsEventManager);
