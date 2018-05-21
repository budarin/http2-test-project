# http2-test-project
Project for discovery Http/2 capabilities

Buggy situation:
if you hol key combination ```cmd+R``` in browser for some time - it leads to the error:

```
npm[8356]: src\node_http2.cc:1934: Assertion `!this->IsDestroyed()' failed.
 1: node::DecodeWrite
 2: node::DecodeWrite
 3: ENGINE_get_ctrl_function
 4: DH_get0_engine
 5: std::basic_ostream<char,std::char_traits<char> >::basic_ostream<char,std::char_traits<char> >
 6: uv_loop_fork
 7: uv_fs_get_statbuf
 8: uv_dlerror
 9: node::CreatePlatform
10: node::CreatePlatform
11: node::Start
12: v8::SnapshotCreator::`default constructor closure'
13: v8::internal::AsmJsScanner::IsNumberStart
14: BaseThreadInitThunk
15: RtlUserThreadStart
```
