import TsBase from "./base";
import TsPacket from "./packet";

export interface Result {
    [pid: number]: ResultItem;
}

export interface ResultItem {
    counter: number;
    duplication: number;
    packet: number;
    error: number;
    drop: number;
    scrambling: number;
}

export default class TsPacketAnalyzer extends TsBase {
    _result: ResultItem[];

    constructor() {
        super();

        this.reset();
    }

    _process(tsPacket: TsPacket, callback: Function): void {
        const pid = tsPacket.getPid();

        // Get result
        const result = this._result[pid];

        // Increment packet
        result.packet++;

        // Check transport_error_indicator
        if (tsPacket.getTransportErrorIndicator() === 1) {
            // Increment error
            result.error++;

            // Emit "packetError" event
            this.emit("packetError", pid);

            callback();
            return;
        }

        // Exists data
        if (tsPacket.hasData()) {
            // Get counter
            const counter = tsPacket.getContinuityCounter();

            // Check discontinuity_indicator
            if (tsPacket.hasAdaptationField() &&
                tsPacket.getAdaptationFieldLength() > 0 &&
                tsPacket.getDiscontinuityIndicator() === 1) {
                // Reset counter
                result.counter = -1;
            }

            // Check drop
            if (result.counter !== -1 && pid !== 0x1FFF) {
                const previous = result.counter;
                const expected = (previous + 1) & 0x0F;
                let drop = false;

                if (counter === previous) {
                    // Increment duplication
                    result.duplication++;

                    if (result.duplication > 1) {
                        drop = true;
                    }
                } else {
                    // Reset duplication
                    result.duplication = 0;

                    if (counter !== expected) {
                        drop = true;
                    }
                }

                if (drop) {
                    // Increment drop
                    result.drop++;

                    // Emit "packetDrop" event
                    this.emit("packetDrop", pid, counter, expected);
                }
            }

            // Set counter
            result.counter = counter;

            // Check transport_scrambling_control
            if (tsPacket.getTransportScramblingControl() >> 1 === 1) {
                // Increment scramble
                result.scrambling++;

                // Emit "packetScrambling" event
                this.emit("packetScrambling", pid);
            }
        }

        this.push(tsPacket);

        callback();
    }

    reset(): void {
        this._result = [];

        for (let i = 0; i < 0x2000; i++) {
            this._result.push({
                counter: -1,
                duplication: 0,
                packet: 0,
                error: 0,
                drop: 0,
                scrambling: 0
            });
        }
    }

    getResult(): Result {
        const result = {};

        for (let i = 0; i < 0x2000; i++) {
            if (this._result[i].packet === 0) {
                continue;
            }

            result[i] = {
                packet: this._result[i].packet,
                error: this._result[i].error,
                drop: this._result[i].drop,
                scrambling: this._result[i].scrambling
            };
        }

        return result;
    }
}
