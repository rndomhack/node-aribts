import crc32Table from "./crc32_table";

export default class TsCrc32 {
    static calc(buffer) {
        let crc = -1;

        for (let i = 0, l = buffer.length; i < l; i++) {
            crc = (crc << 8) ^ crc32Table[(crc >>> 24) ^ buffer[i]];
        }

        return crc;
    }

    static calcToBuffer(buffer) {
        const result = Buffer.alloc(4);

        result.writeInt32BE(TsCrc32.calc(buffer), 0);

        return result;
    }
}
