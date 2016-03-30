"use strict";

const fs = require("fs");
const util = require("util");
const aribts = require("../index");
const TsStream = aribts.TsStream;
const TsUtil = aribts.TsUtil;

const readStream = fs.createReadStream(process.argv[2]);
const tsStream = new TsStream();

const tsUtil = new TsUtil();

readStream.pipe(tsStream);

tsStream.on("data", () => {});

tsStream.on("eit", (pid, data) => {
    if (pid !== 0x12) return;

    tsUtil.addEit(pid, data);

    if (!tsUtil.isSchedule()) return;

    console.log("schedule", util.inspect(tsUtil.getSchedule(), {depth: null}));

    tsStream.removeAllListeners();
    readStream.unpipe(tsStream);
    tsStream.end();
});
