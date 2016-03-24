# aribts
MPEG-2 TS Stream Tool for node

## Install
```sh
npm i --save aribts
```

## Example
This example selects only first pmt.

```js
const aribts = require("aribts");

const readable = fs.createReadStream(process.argv[2]);
const tsStream = new aribts.TsStream({
    transform: true,
    transPmtIds: [0]
});
const writable = fs.createWriteStream(process.argv[3]);

readable.pipe(tsStream);
tsStream.write(writable);
```

This example emits some info event.

```js
const aribts = require("aribts");

const readable = fs.createReadStream(process.argv[2]);
const tsStream = new aribts.TsStream();

readable.pipe(tsStream);
tsStream.on("data", data => {});

tsStream.on("info", data => {
    console.log("info", data);
});

tsStream.on("drop", pid => {
    console.log("drop", pid);
});

tsStream.on("scrambling", pid => {
    console.log("scrambling", pid);
});
```


## new aribts.TsStream(options)
### arguments
- `options`
  - `transform` - `boolean` Whether or not to select pakcet.
  - `skipSize` - `number` Skip packets num.
  - `packetSize` - `number` Input packet size (188 only now).
  - `bufferSize` - `number` Buffering size.
  - `transPmtIds` - `array` PMT IDs using to select packet.
  - `transPmtPids` - `array` PMT PIDs using to select packet.
  - `transPmtSids` - `array` PMT SIDs using to select packet.
  - `transPids` - `array` PIDs using to select packet.

### Events
- `packet` - (data) Parsed packet object.
- `drop` - (pid) Emit when drop is happened.
- `scrambling` - (pid) Emit when scrambling is happened.
- `info` - (data) TS info object.
- `pat`, `cat`, `pmt`... - (pid, data) Table object.
