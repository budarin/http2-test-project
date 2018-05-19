# http2-test-project
Project for discovery Http/2 capabilities

Buggy situations
- if set timeout to a noticeable
```
setTimeout(resolve, 0); -> setTimeout(resolve, 1000);
```
 
and try to quicly refresh the page - error:

```
(node:3652) UnhandledPromiseRejectionWarning: Error [ERR_STREAM_WRITE_AFTER_END]: write after end
    at writeAfterEnd (_stream_writable.js:243:12)
    at ServerHttp2Stream.Writable.write (_stream_writable.js:292:5)
    at secondRender (D:\Projects\http2-test-project\index.js:71:12)
(node:3652) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 2)

```
- if uncomment these lines with unused assets (comment before emulation of a long rendering):
```js
    // pushAsset(stream, jsFile1);
    // pushAsset(stream, jsFile2);
```
and try quicly refresh the page - error:
```
events.js:167
      throw er; // Unhandled 'error' event
      ^

Error [ERR_HTTP2_STREAM_ERROR]: Stream closed with error code NGHTTP2_REFUSED_STREAM
    at ServerHttp2Stream._destroy (internal/http2/core.js:1871:13)
    at ServerHttp2Stream.destroy (internal/streams/destroy.js:32:8)
    at ServerHttp2Stream.[maybe-destroy] (internal/http2/core.js:1887:12)
    at Http2Stream.onStreamClose [as onstreamclose] (internal/http2/core.js:346:26)
Emitted 'error' event at:
    at emitErrorNT (internal/streams/destroy.js:82:8)
    at emitErrorAndCloseNT (internal/streams/destroy.js:50:3)
    at process._tickCallback (internal/process/next_tick.js:63:19)
```
