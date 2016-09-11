"use strict";

const EventEmitter3 = require("eventemitter3");

class TsBase extends EventEmitter3 {
    constructor() {
        super();

        this.pipes = [];
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

    push(data) {
        this.emit("data", data);

        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].process(data);
        }
    }

    end() {
        this.finish();

        this.emit("finish");

        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].end();
        }
    }

    process() {
        // Nothing
    }

    finish() {
        // Nothing
    }
}

module.exports = TsBase;
