---
title: "mo-service profiling flags"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: true
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "mo-service exposes --block-profile-rate and --mutex-profile-fraction flags that drive Go runtime block and mutex profilers for continuous profiling against the /debug/pprof endpoints in MatrixOne."
---

# **mo-service profiling flags**

> Starting in v3.0.11, `mo-service` accepts `--block-profile-rate` and `--mutex-profile-fraction` command-line flags that drive the Go runtime block and mutex profilers, and can be scraped via the `/debug/pprof/block` and `/debug/pprof/mutex` endpoints exposed by `--debug-http`.

`mo-service` is the executable that runs a MatrixOne node. Starting with v3.0.11, `mo-service` accepts two command-line flags that enable the Go runtime's block and mutex profilers. They are intended for continuous profiling setups (for example, Pyroscope or `go tool pprof` collection against the `/debug/pprof/block` and `/debug/pprof/mutex` endpoints exposed by `--debug-http`).

Either flag can be disabled by passing `0`.

## Flags

| Flag | Default | Effect |
| ---- | ---- | ---- |
| `--block-profile-rate` | `5` | Controls the fraction of goroutine blocking events that are reported in the block profile. Internally calls Go's `runtime.SetBlockProfileRate(rate)`. `0` disables the block profile. Recommended values: `100` for production, `1` for debugging. |
| `--mutex-profile-fraction` | `100` | Controls the fraction of mutex contention events that are reported in the mutex profile. Internally calls Go's `runtime.SetMutexProfileFraction(rate)`. `0` disables the mutex profile. Recommended values: `100` for production, `1` for debugging. |

When a positive value is applied at startup, `mo-service` logs a line such as `Block profiling enabled with rate: 5` or `Mutex profiling enabled with fraction: 100`.

## Example

```bash
# Enable both profiles with debugging-level granularity while keeping the HTTP
# debug server available for pprof collection.
mo-service \
  --cfg etc/launch-with-dnservice/cn.toml \
  --debug-http 0.0.0.0:12345 \
  --block-profile-rate 1 \
  --mutex-profile-fraction 1
```

## See also

- `--debug-http`: listen address for the Go pprof HTTP handlers.
- `--profile-interval`: duration for periodic profile rotation.
