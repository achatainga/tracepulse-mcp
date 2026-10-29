# TracePulse MCP

> Headless CDP Frame-Rate & UI Micro-Leak Profiler for Autonomous Coding Agents.

[![MCP 2026-07-28](https://img.shields.io/badge/MCP-2026--07--28-blue.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## The Problem
Autonomous AI agents frequently introduce frontend regressions that unit tests fail to catch:
1. **Re-render Storms**: Unmemoized state updates inside `useEffect` triggering 50+ re-renders per second.
2. **Uncleaned Timers & Listeners**: Interval, timeout, or `requestAnimationFrame` handles left running after component unmounts.
3. **Catastrophic Jank**: Blocking calculations executing on the main UI thread that drop frame rates from 60 FPS down to unnavigable single digits.

## The Solution
TracePulse MCP provides headless runtime UI telemetry:
- **Loop Profiler**: Detects cascading re-render loops and points agents directly to the offending dependency arrays.
- **Leak Sentinel**: Tracks handles across component lifecycles to guarantee cleanup functions are present and correct.
- **Frame-Rate Auditor**: Measures longest task duration and jank percentages against 60 FPS standards.

## Available Tools

### `profile_render_lifecycle`
Evaluates component render frequency and isolates infinite cascading update loops.

### `detect_raf_memory_leaks`
Monitors active intervals, timers, and animation frame handles during unmount events.

### `compute_fps_score`
Calculates frame drops, jank percentage, and longest task latency.

## Live Verification
```bash
node tests/run_live_test.mjs
```

## License
MIT © 2026 TracePulse Systems
