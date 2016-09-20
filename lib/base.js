"use strict";

const EventEmitter3 = require("eventemitter3");

class TsBase extends EventEmitter3 {
    constructor() {
        super();

        let _isDataRequired = false;

        let _processing = 0;
        let _callback = null;
        let _upstreamCallback = null;

        let _pipes = [];
        let _finishPipes = [];
        let _writePipes = [];
        let _queue = [];


        const process = this._process.bind(this);
        const flush = this._flush.bind(this);

        const checkDataListener = () => {
            if (this.listeners("data", true)) {
                _isDataRequired = true;
            } else {
                _isDataRequired = false;
            }
        };

        const completeCallback = () => {
            if (--_processing !== 0) return;

            const callback = _callback;

            _callback = null;

            callback();
        };

        const finishCallback1 = () => {
            for (let i = 0, l = _queue.length; i < l; i++) {
                if (_isDataRequired) {
                    this.emit("data", _queue[i]);
                }

                const writePipes = _writePipes;

                for (let j = 0, l2 = writePipes.length; j < l2; j++) {
                    writePipes[j](_queue[i], completeCallback);
                }

                _processing += writePipes.length;

                if (_processing !== 0) {
                    _queue = _queue.slice(i + 1);
                    _callback = finishCallback1;
                    return;
                }
            }

            _queue = [];

            const finishPipes = _finishPipes;

            for (let i = 0, l = finishPipes.length; i < l; i++) {
                finishPipes[i](completeCallback);
            }

            _processing += finishPipes.length;

            if (_processing !== 0) {
                _callback = finishCallback2;
                return;
            }

            this.emit("finish");

            const callback = _upstreamCallback;

            _callback = null;
            _upstreamCallback = null;

            callback();
        };

        const finishCallback2 = () => {
            const callback = _upstreamCallback;

            _callback = null;
            _upstreamCallback = null;

            callback();
        };

        const writeCallback = () => {
            for (let i = 0, l = _queue.length; i < l; i++) {
                if (_isDataRequired) {
                    this.emit("data", _queue[i]);
                }

                const writePipes = _writePipes;

                for (let j = 0, l2 = writePipes.length; j < l2; j++) {
                    writePipes[j](_queue[i], completeCallback);
                }

                _processing += writePipes.length;

                if (_processing !== 0) {
                    _queue = _queue.slice(i + 1);
                    _callback = writeCallback;
                    return;
                }
            }

            _queue = [];

            const callback = _upstreamCallback;

            _callback = null;
            _upstreamCallback = null;

            callback();
        };

        this.on = (_event, fn, context) => {
            super.on(_event, fn, context);

            if (_event === "data") {
                checkDataListener();
            }

            return this;
        };

        this.once = (_event, fn, context) => {
            super.once(_event, fn, context);

            if (_event === "data") {
                checkDataListener();
                super.once("data", checkDataListener.bind(this));
            }

            return this;
        };

        this.off = (_event, fn, context, once) => {
            return this.removeListener(_event, fn, context, once);
        };

        this.addListener = (_event, fn, context) => {
            return this.on(_event, fn, context);
        };

        this.removeListener = (_event, fn, context, once) => {
            super.removeListener(_event, fn, context, once);

            if (_event === "data") {
                checkDataListener();
            }

            return this;
        };

        this.removeAllListeners = (_event) => {
            super.removeAllListeners(_event);
            checkDataListener();

            return this;
        };

        this.pipe = pipe => {
            if (_pipes.includes(pipe)) return false;

            _pipes = _pipes.slice();
            _pipes.push(pipe);

            _writePipes = _writePipes.slice();
            _writePipes.push(pipe._write.bind(pipe));

            _finishPipes = _finishPipes.slice();
            _finishPipes.push(pipe._finish.bind(pipe));

            pipe.emit("pipe", this);

            return true;
        };

        this.unpipe = pipe => {
            if (!_pipes.includes(pipe)) return false;

            const index = _pipes.indexOf(pipe);

            _pipes = _pipes.slice();
            _pipes.splice(index, 1);

            _finishPipes = _finishPipes.slice();
            _finishPipes.splice(index, 1);

            _writePipes = _writePipes.slice();
            _writePipes.splice(index, 1);

            pipe.emit("unpipe", this);

            return true;
        };

        this.push = data => {
            _queue.push(data);
        };

        this._finish = callback => {
            flush(completeCallback);

            _processing++;

            if (_processing !== 0) {
                _callback = finishCallback1;
                _upstreamCallback = callback;
                return;
            }

            this.emit("finish");

            for (let i = 0, l = _queue.length; i < l; i++) {
                if (_isDataRequired) {
                    this.emit("data", _queue[i]);
                }

                const writePipes = _writePipes;

                for (let j = 0, l2 = writePipes.length; j < l2; j++) {
                    writePipes[j](_queue[i], completeCallback);
                }

                _processing += writePipes.length;

                if (_processing !== 0) {
                    _queue = _queue.slice(i + 1);
                    _callback = finishCallback1;
                    _upstreamCallback = callback;
                    return;
                }
            }

            _queue = [];

            const finishPipes = _finishPipes;

            for (let i = 0, l = finishPipes.length; i < l; i++) {
                finishPipes[i](completeCallback);
            }

            _processing += finishPipes.length;

            if (_processing !== 0) {
                _callback = finishCallback2;
                _upstreamCallback = callback;
                return;
            }

            callback();
        };

        this._write = (data, callback, check) => {
            if (check) console.log(this.constructor.name);
            process(data, completeCallback);

            _processing++;

            if (_processing !== 0) {
                _callback = writeCallback;
                _upstreamCallback = callback;
                return;
            }

            for (let i = 0, l = _queue.length; i < l; i++) {
                if (_isDataRequired) {
                    this.emit("data", _queue[i]);
                }

                const writePipes = _writePipes;

                for (let j = 0, l2 = writePipes.length; j < l2; j++) {
                    writePipes[j](_queue[i], completeCallback);
                }

                _processing += writePipes.length;

                if (_processing !== 0) {
                    _queue = _queue.slice(i + 1);
                    _callback = writeCallback;
                    _upstreamCallback = callback;
                    return;
                }
            }

            _queue = [];

            callback();
        };
    }

    _process(data, callback) {
        callback();
    }

    _flush(callback) {
        callback();
    }
}

module.exports = TsBase;
