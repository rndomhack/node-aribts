"use strict";

const stream = require("stream");

class TsReadableConnector extends stream.Writable {
    constructor() {
        super();

        let _pipes = [];

        let _processing = 0;
        let _callback = null;

        const completeCallback = () => {
            if (--_processing !== 0) return;

            const callback = _callback;

            _callback = null;

            callback();
        };

        this.pipe = pipe => {
            if (_pipes.includes(pipe)) return false;

            _pipes = _pipes.slice();
            _pipes.push(pipe);

            pipe.emit("pipe", this);

            return true;
        };

        this.unpipe = pipe => {
            if (!_pipes.includes(pipe)) return false;

            _pipes = _pipes.slice();
            _pipes.splice(_pipes.indexOf(pipe), 1);

            pipe.emit("unpipe", this);

            return true;
        };

        this._finish = () => {
            const pipes = _pipes;

            for (let i = 0, l = pipes.length; i < l; i++) {
                pipes[i]._finish(completeCallback);
            }

            _processing += pipes.length;

            if (_processing !== 0) {
                _callback = () => {
                    // Nothing
                };
                return;
            }
        };

        this._write = (chunk, encoding, callback) => {
            const pipes = _pipes;

            for (let i = 0, l = pipes.length; i < l; i++) {
                pipes[i]._write(chunk, completeCallback);
            }

            _processing += pipes.length;

            if (_processing !== 0) {
                _callback = callback;
                return;
            }

            callback();
        };

        this.on("finish", this._finish);
    }
}

module.exports = TsReadableConnector;
