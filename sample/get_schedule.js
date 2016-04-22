"use strict";

const fs = require("fs");
const util = require("util");
const aribts = require("../index");
const TsStream = aribts.TsStream;
const TsUtil = aribts.TsUtil;

const readStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const tsStream = new TsStream();

const tsUtil = new TsUtil();

readStream.pipe(tsStream);

tsStream.on("data", () => {});

tsStream.on("tot", (pid, data) => {
    tsUtil.addTot(pid, data);
});

tsStream.on("eit", (pid, data) => {
    if (pid !== 0x12) return;

    tsUtil.addEit(pid, data);

    if (data.table_id === 0x4E || data.table_id === 0x4F) return;

    let amount = tsUtil.getScheduleAmount();
    console.error("\u001b[2A");
    console.error(`Check - ${amount[1]} of ${amount[0]} [${Math.floor(amount[1] / amount[0] * 100)}%]`);

    if (!tsUtil.isSchedule()) return;

    console.error("schedule", util.inspect(tsUtil.getSchedule(), {depth: null}));

    tsStream.removeAllListeners();
    readStream.unpipe(tsStream);
    tsStream.end();
});
