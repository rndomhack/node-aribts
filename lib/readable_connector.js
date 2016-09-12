"use strict";

const stream = require("stream");

class TsReadableConnector extends stream.Writable {
    constructor() {
        super();

        this.pipes = [];

        this.on("finish", this.end.bind(this));
    }

    pipe(pipe) {
        if (this.pipes.includes(pipe)) return false;

        this.pipes = this.pipes.slice();
        this.pipes.push(pipe);

        return true;
    }

    unpipe(pipe) {
        if (!this.pipes.includes(pipe)) return false;

        this.pipes = this.pipes.slice();
        this.pipes.splice(this.pipes.indexOf(pipe), 1);

        return true;
    }

    end() {
        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].end();
        }
    }

    read() {
        // Nothing
    }

    _write(chunk, encoding, callback) {
        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].process(chunk);
        }

        callback();
    }

    _writev(chunks, callback) {
        const pipes = this.pipes;

        for (let i = 0, l = chunks.length; i < l; i++) {
            for (let j = 0, l2 = pipes.length; i < l2; i++) {
                pipes[j].process(chunks[i]);
            }
        }

        callback();
    }
}

module.exports = TsReadableConnector;
