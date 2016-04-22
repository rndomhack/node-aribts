"use strict";

const fs = require("fs");
const util = require("util");
const aribts = require("../index");
const TsStream = aribts.TsStream;
const TsUtil = aribts.TsUtil;

const readStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const tsStream = new TsStream();

const tsUtil = new TsUtil();

let time = null;
let ids = null;

readStream.pipe(tsStream);

tsStream.on("data", () => {});

tsStream.on("eit", (pid, data) => {
    tsUtil.addEit(pid, data);

    if (time === null) {
        if (tsUtil.isTime()) {
            time = tsUtil.getTime();
        } else {
            return;
        }
    }

    if (ids === null) {
        if (tsUtil.isOriginalNetworkId() && tsUtil.isTransportStreamId() && tsUtil.isServiceIds()) {
            ids = {
                onid: tsUtil.getOriginalNetworkId(),
                tsid: tsUtil.getTransportStreamId(),
                sid: tsUtil.getServiceIds()[0]
            };
        } else {
            return;
        }
    }

    if (process.argv[2] !== "-" && tsUtil.getTime().getTime() - time.getTime() < 30 * 1000) return;
    if (!tsUtil.isPresent(ids.onid, ids.tsid, ids.sid)) return;
    if (!tsUtil.isFollowing(ids.onid, ids.tsid, ids.sid)) return;

    console.error("present", util.inspect(tsUtil.getPresent(ids.onid, ids.tsid, ids.sid), {depth: null}));
    console.error("following", util.inspect(tsUtil.getFollowing(ids.onid, ids.tsid, ids.sid), {depth: null}));

    tsStream.removeAllListeners();
    readStream.unpipe(tsStream);
    tsStream.end();
});

tsStream.on("pat", (pid, data) => {
    tsUtil.addPat(pid, data);
});

tsStream.on("sdt", (pid, data) => {
    tsUtil.addSdt(pid, data);
});

tsStream.on("tdt", (pid, data) => {
    tsUtil.addTdt(pid, data);
});

tsStream.on("tot", (pid, data) => {
    tsUtil.addTot(pid, data);
});
