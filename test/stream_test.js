"use strict";

const fs = require("fs");
const stream = require("stream");
const aribts = require("../lib/index");

const size = process.argv[2] === "-" ? 0 : fs.statSync(process.argv[2]).size;
let bytesRead = 0;

const readableStream = process.argv[2] === "-" ? process.stdin : fs.createReadStream(process.argv[2]);
const writableStream = new stream.Writable({
    write(chunk, encoding, callback) {
        setTimeout(() => {
            callback();
        }, 10);
    }
});
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
        process.stderr.write(`Done - ${bytesRead} of ${size} [${Math.floor(bytesRead / size * 100)}%]`);

        done();
    }
});

const tsReadableConnector = new aribts.TsReadableConnector();
const tsWritableConnector = new aribts.TsWritableConnector();

readableStream.pipe(transformStream);
transformStream.pipe(tsReadableConnector);
tsReadableConnector.pipe(tsWritableConnector);
tsWritableConnector.pipe(writableStream);
