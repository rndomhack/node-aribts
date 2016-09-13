"use strict";

const EventEmitter3 = require("eventemitter3");

class TsBase extends EventEmitter3 {
    constructor() {
        super();

        this.pipes = [];
        this.temp = [];
    }

    pipe(pipe) {
        if (this.pipes.includes(pipe)) return false;

        this.pipes = this.pipes.slice();
        this.pipes.push(pipe);

        pipe.emit("pipe", this);

        return true;
    }

    unpipe(pipe) {
        if (!this.pipes.includes(pipe)) return false;

        this.pipes = this.pipes.slice();
        this.pipes.splice(this.pipes.indexOf(pipe), 1);

        pipe.emit("unpipe", this);

        return true;
    }

    push(data) {
        this.temp.push(data);
    }

    end() {
        this._finish();

        this.emit("finish");

        const pipes = this.pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i].end();
        }
    }

    write(data, callback) {
        this._process(data);

        let pause = 0;

        for (let i = 0, l = this.temp.length; i < l; i++) {
            const pipes = this.pipes;

            for (let j = 0, l2 = pipes.length; j < l2; j++) {
                pause += pipes[j].write(this.temp[i], callback);
            }
        }

        this.temp = [];

        return pause;
    }

    _process() {
        // Nothing
    }

    _finish() {
        // Nothing
    }
}

module.exports = TsBase;
