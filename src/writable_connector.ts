import { Readable } from "stream";

export type Write = (data: Buffer, callback: Function) => void;
export type Finish = (callback: Function) => void;

export default class TsWritableConnector extends Readable {
    _write: Write;
    _finish: Finish;

    constructor() {
        super();

        let _callback = null;

        this._read = () => {
            if (_callback === null) {
                return;
            }

            const callback = _callback;

            _callback = null;

            callback();
        };

        this._write = (data, callback) => {
            if (!this.push(data)) {
                _callback = callback;
                return;
            }

            callback();
        };

        this._finish = callback => {
            this.push(null);

            this.emit("finish");

            callback();
        };

        this.on("unpipe", this._read.bind(this));
    }
}
