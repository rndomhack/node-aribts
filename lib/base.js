"use strict";

const EventEmitter3 = require("eventemitter3");

class TsBase extends EventEmitter3 {
    constructor() {
        super();

        this._pipes = [];
        this._queue = [];

        this._isDataRequired = false;

        this._processing = 0;
        this._callback = null;
        this._upstreamCallback = null;

        this._completeCallback = this._completeCallback.bind(this);
        this._finishCallback1 = this._finishCallback1.bind(this);
        this._finishCallback2 = this._finishCallback2.bind(this);
        this._writeCallback = this._writeCallback.bind(this);
    }

    on(_event, fn, context) {
        super.on(_event, fn, context);

        if (_event === "data") {
            this._checkDataListener();
        }

        return this;
    }

    once(_event, fn, context) {
        super.once(_event, fn, context);

        if (_event === "data") {
            this._checkDataListener();
            super.once("data", this._checkDataListener.bind(this));
        }

        return this;
    }

    off(_event, fn, context, once) {
        return this.removeListener(_event, fn, context, once);
    }

    addListener(_event, fn, context) {
        return this.on(_event, fn, context);
    }

    removeListener(_event, fn, context, once) {
        super.removeListener(_event, fn, context, once);

        if (_event === "data") {
            this._checkDataListener();
        }

        return this;
    }

    removeAllListeners(_event) {
        super.removeAllListeners(_event);
        this._checkDataListener();

        return this;
    }

    pipe(pipe) {
        if (this._pipes.includes(pipe)) return false;

        this._pipes = this._pipes.slice();
        this._pipes.push(pipe);

        pipe.emit("pipe", this);

        return true;
    }

    unpipe(pipe) {
        if (!this._pipes.includes(pipe)) return false;

        this._pipes = this._pipes.slice();
        this._pipes.splice(this._pipes.indexOf(pipe), 1);

        pipe.emit("unpipe", this);

        return true;
    }

    push(data) {
        this._queue.push(data);
    }

    _checkDataListener() {
        if (this.listeners("data", true)) {
            this._isDataRequired = true;
        } else {
            this._isDataRequired = false;
        }
    }

    _completeCallback() {
        if (--this._processing !== 0) return;

        const callback = this._callback;

        this._callback = null;

        callback();
    }

    _finishCallback1() {
        for (let i = 0, l = this._queue.length; i < l; i++) {
            if (this._isDataRequired) {
                this.emit("data", this._queue[i]);
            }

            const pipes = this._pipes;

            for (let j = 0, l2 = pipes.length; j < l2; j++) {
                pipes[j]._write(this._queue[i], this._completeCallback);
            }

            this._processing += pipes.length;

            if (this._processing !== 0) {
                this._queue = this._queue.slice(i + 1);
                return;
            }
        }

        this._queue = [];

        const pipes = this._pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i]._finish(this._completeCallback);
        }

        this._processing += pipes.length;

        if (this._processing !== 0) {
            this._callback = this._finishCallback2;
            return;
        }

        this.emit("finish");

        const callback = this._upstreamCallback;

        this._callback = null;
        this._upstreamCallback = null;

        callback();
    }

    _finishCallback2() {
        const callback = this._upstreamCallback;

        this._callback = null;
        this._upstreamCallback = null;

        callback();
    }

    _writeCallback() {
        for (let i = 0, l = this._queue.length; i < l; i++) {
            if (this._isDataRequired) {
                this.emit("data", this._queue[i]);
            }

            const pipes = this._pipes;

            for (let j = 0, l2 = pipes.length; j < l2; j++) {
                pipes[j]._write(this._queue[i], this._completeCallback);
            }

            this._processing += pipes.length;

            if (this._processing !== 0) {
                this._queue = this._queue.slice(i + 1);
                return;
            }
        }

        this._queue = [];

        const callback = this._upstreamCallback;

        this._callback = null;
        this._upstreamCallback = null;

        callback();
    }

    _finish(callback) {
        this._flush(this._completeCallback);

        this._processing++;

        if (this._processing !== 0) {
            this._callback = this._finishCallback1;
            this._upstreamCallback = callback;
            return;
        }

        this.emit("finish");

        for (let i = 0, l = this._queue.length; i < l; i++) {
            if (this._isDataRequired) {
                this.emit("data", this._queue[i]);
            }

            const pipes = this._pipes;

            for (let j = 0, l2 = pipes.length; j < l2; j++) {
                pipes[j]._write(this._queue[i], this._completeCallback);
            }

            this._processing += pipes.length;

            if (this._processing !== 0) {
                this._queue = this._queue.slice(i + 1);
                this._callback = this._finishCallback1;
                this._upstreamCallback = callback;
                return;
            }
        }

        this._queue = [];

        const pipes = this._pipes;

        for (let i = 0, l = pipes.length; i < l; i++) {
            pipes[i]._finish(this._completeCallback);
        }

        this._processing += pipes.length;

        if (this._processing !== 0) {
            this._callback = this._finishCallback2;
            this._upstreamCallback = callback;
            return;
        }

        callback();
    }

    _write(data, callback) {
        this._process(data, this._completeCallback);

        this._processing++;

        if (this._processing !== 0) {
            this._callback = this._writeCallback;
            this._upstreamCallback = callback;
            return;
        }

        for (let i = 0, l = this._queue.length; i < l; i++) {
            if (this._isDataRequired) {
                this.emit("data", this._queue[i]);
            }

            const pipes = this._pipes;

            for (let j = 0, l2 = pipes.length; j < l2; j++) {
                pipes[j]._write(this._queue[i], this._completeCallback);
            }

            this._processing += pipes.length;

            if (this._processing !== 0) {
                this._queue = this._queue.slice(i + 1);
                this._callback = this._writeCallback;
                this._upstreamCallback = callback;
                return;
            }
        }

        this._queue = [];

        callback();
    }

    _process(data, callback) {
        callback();
    }

    _flush(callback) {
        callback();
    }
}

module.exports = TsBase;
