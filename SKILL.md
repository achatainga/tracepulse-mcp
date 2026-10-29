---
name: tracepulse-mcp
description: Headless CDP Frame-Rate & UI Micro-Leak Profiler for Autonomous Coding Agents.
version: 1.0.0
tags:
  - react
  - performance
  - cdp
  - memory-leak
  - fps
  - rerender-storm
---

# TracePulse: Headless UI Profiler & Frame-Rate Sentinel

TracePulse detects subtle UI state machine collisions, infinite `useEffect` re-render storms, and uncleaned timer leaks that static linters and unit tests completely miss.

## The Problem

Agents frequently produce code that passes `npm run build` and unit tests with 100% success, but causes catastrophic real-world failure:
1. **Re-render Storms**: Unmemoized state objects inside `useEffect` trigger 100+ re-renders per second, locking the browser UI thread.
2. **Timer Leaks**: Event listeners, intervals, and `requestAnimationFrame` loops created inside components fail to clean up on unmount, consuming CPU indefinitely.
3. **Severe Jank**: Heavy synchronous calculations during interactions drop the framerate from 60 FPS down to under 5 FPS.

## Core Capabilities

1. **Re-render Storm Detector**:
   - Traces component render counts under rapid user input and flags cascading re-render loops.
2. **Lifecycle Leak Sentinel**:
   - Monitors active intervals, timeouts, and animation frame requests across component mount/unmount cycles.
3. **Jank & Long Task Metric Evaluation**:
   - Analyzes execution timelines and computes frame drops, longest task latency, and 60 FPS health score.
4. **Actionable Remediation Hints**:
   - Pinpoints unmemoized dependencies (`useCallback`, `useMemo`) and unreturned cleanup functions in hooks.

## Available MCP Tools

- `profile_render_lifecycle`: Analyzes component render frequencies and identifies cascading loops.
- `detect_raf_memory_leaks`: Audits active background timers and animation frame handles during unmount.
- `compute_fps_score`: Evaluates framerate stability, task durations, and UI thread responsiveness.

## Hook Integration

TracePulse registers a `PostToolUse` hook in `hooks/hooks.json` to inspect frontend test execution results and verify zero memory or re-render degradation.
