# http2-test-project
Project for discovery Http/2 capabilities

Buggy situation:
if uncomment these lines with unused assets:
```js
    // pushAsset(stream, jsFile1);
    // pushAsset(stream, jsFile2);
```
and try quickly refresh the page - error:
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
