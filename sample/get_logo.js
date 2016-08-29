"use strict";

const fs = require("fs");
const util = require("util");
const aribts = require("../index");
const TsStream = aribts.TsStream;
const TsUtil = aribts.TsUtil;

if (process.argv < 3) {
    console.error("Usage: node get_logo.js /path/to/file.ts");
    process.exit(1);
}

const readStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const tsStream = new TsStream();

const tsUtil = new TsUtil();

let ids = null;
let logoId = null;

function listener() {
    if (ids === null) {
        if (tsUtil.hasOriginalNetworkId() && tsUtil.hasTransportStreamId() && tsUtil.hasServiceIds()) {
            ids = {
                onid: tsUtil.getOriginalNetworkId(),
                tsid: tsUtil.getTransportStreamId(),
                sid: tsUtil.getServiceIds()[0]
            };

            console.error("Get ids");
        } else {
            return;
        }
    }

    if (logoId === null) {
        if (tsUtil.hasLogoId(ids.onid, ids.tsid, ids.sid)) {
            logoId = tsUtil.getLogoId(ids.onid, ids.tsid, ids.sid);

            console.error("Get logoId");
        } else {
            return;
        }
    }

    if (!tsUtil.hasLogo(logoId, ids.onid)) return;

    console.error("logo", util.inspect(tsUtil.getLogo(logoId, ids.onid), {depth: null}));

    let logo = tsUtil.getLogo(logoId, ids.onid);

    let promise = Promise.resolve();

    Object.keys(logo).forEach(key => {
        promise = promise.then(() => {
            return saveLogo(`${ids.onid}-${ids.tsid}-${ids.sid}-${key}.png`, logo[key]);
        });
    });

    promise.catch(err => {
        console.error(`Error: ${err.message}`);
    });

    tsStream.removeAllListeners();
    readStream.unpipe(tsStream);
    tsStream.end();
}

function saveLogo(file, data) {
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

readStream.pipe(tsStream);

tsStream.on("data", () => {});

tsStream.on("pat", (pid, data) => {
    tsUtil.addPat(pid, data);
});

tsStream.on("dsmcc", (pid, data) => {
    tsUtil.addDsmcc(pid, data);
    listener();
});

tsStream.on("nit", (pid, data) => {
    tsUtil.addNit(pid, data);
});

tsStream.on("sdt", (pid, data) => {
    tsUtil.addSdt(pid, data);
});

tsStream.on("sdtt", (pid, data) => {
    tsUtil.addSdtt(pid, data);
});

tsStream.on("cdt", (pid, data) => {
    tsUtil.addCdt(pid, data);
    listener();
});
