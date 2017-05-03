import * as stream from "stream";

export type Write = (data: Buffer, callback: Function) => void;
export type Finish = () => void;

export default class TsReadableConnector extends stream.Writable {
    unpipe: <T>(pipe: T) => T;
    _finish: Finish;

    constructor() {
        super();

        let _pipes = [];

        let _processing = 0;
        let _callback = null;

        const completeCallback = () => {
            if (--_processing !== 0) {
                return;
            }

            const callback = _callback;

            _callback = null;

            callback();
        };

        this.pipe = pipe => {
            if (_pipes.includes(pipe)) {
                return pipe;
            }

            _pipes = _pipes.slice();
            _pipes.push(pipe);

            pipe.emit("pipe", this);

            return pipe;
        };

        this.unpipe = pipe => {
            if (!_pipes.includes(pipe)) {
                return pipe;
            }

            _pipes = _pipes.slice();
            _pipes.splice(_pipes.indexOf(pipe), 1);

            pipe.emit("unpipe", this);

            return pipe;
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

        this.on("finish", this._finish);
    }
}
