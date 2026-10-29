/**
 * TracePulse Engine (Stateless MCP 2026-07-28 Spec)
 * Headless UI Profiler & Frame-Rate Sentinel
 */

export class TracePulseEngine {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Analyzes component render lifecycle logs for re-render storms and cascading dependencies.
   */
  profileRenderLifecycle(renderEvents = [], timeWindowMs = 1000) {
    const componentStats = new Map();

    for (const evt of renderEvents) {
      const comp = evt.component || 'UnknownComponent';
      const stats = componentStats.get(comp) || { count: 0, totalDurationMs: 0, causes: [] };
      stats.count += 1;
      stats.totalDurationMs += evt.durationMs || 1;
      if (evt.cause) stats.causes.push(evt.cause);
      componentStats.set(comp, stats);
    }

    const issues = [];
    for (const [comp, stats] of componentStats.entries()) {
      const rendersPerSec = (stats.count / (timeWindowMs / 1000));
      if (rendersPerSec >= 15) {
        issues.push({
          component: comp,
          type: 'RE_RENDER_STORM',
          severity: 'BLOCKING',
          rendersPerSec: Math.round(rendersPerSec),
          totalRenders: stats.count,
          probableCauses: stats.causes.slice(0, 3),
          recommendation: `Component '${comp}' rendered ${stats.count} times in ${timeWindowMs}ms. Wrap state callbacks in useCallback/useMemo and ensure useEffect dependency arrays do not include newly instantiated object literals.`
        });
      }
    }

    return {
      windowMs: timeWindowMs,
      totalRenderEvents: renderEvents.length,
      hasSevereDegradation: issues.length > 0,
      issues
    };
  }

  /**
   * Detects uncleaned timers, intervals, and requestAnimationFrame handles during component unmount.
   */
  detectRafMemoryLeaks(lifecycleEvents = []) {
    const activeHandles = {
      interval: 0,
      timeout: 0,
      raf: 0,
      listener: 0
    };
    const leaks = [];

    for (const evt of lifecycleEvents) {
      if (evt.action === 'allocate') {
        if (activeHandles[evt.kind] !== undefined) activeHandles[evt.kind]++;
      } else if (evt.action === 'cleanup') {
        if (activeHandles[evt.kind] !== undefined && activeHandles[evt.kind] > 0) {
          activeHandles[evt.kind]--;
        }
      } else if (evt.action === 'unmount') {
        const remaining = Object.entries(activeHandles).filter(([_, count]) => count > 0);
        if (remaining.length > 0) {
          leaks.push({
            component: evt.component || 'RootComponent',
            type: 'UNMOUNT_RESOURCE_LEAK',
            severity: 'CRITICAL',
            leakedResources: Object.fromEntries(remaining),
            recommendation: `Component unmounted with active resources (${remaining.map(([k, v]) => `${v} ${k}s`).join(', ')}). Return a cleanup function from useEffect to clear timers and detach listeners.`
          });
        }
      }
    }

    return {
      totalLeaks: leaks.length,
      hasLeaks: leaks.length > 0,
      leaks
    };
  }

  /**
   * Computes FPS score, frame jank percentage, and longest task latency.
   */
  computeFpsScore(frameDurationsMs = []) {
    if (frameDurationsMs.length === 0) {
      return { averageFps: 60, jankPercentage: 0, longestTaskMs: 0, score: 100, grade: 'A' };
    }

    const totalDuration = frameDurationsMs.reduce((acc, v) => acc + v, 0);
    const averageFrameTime = totalDuration / frameDurationsMs.length;
    const averageFps = Math.round(1000 / (averageFrameTime || 16.6));

    // A janky frame is any frame exceeding 16.67ms (60 FPS threshold)
    const jankyFrames = frameDurationsMs.filter(ms => ms > 16.67).length;
    const jankPercentage = Math.round((jankyFrames / frameDurationsMs.length) * 100);
    const longestTaskMs = Math.max(...frameDurationsMs);

    let grade = 'A';
    if (jankPercentage > 40 || longestTaskMs > 100) grade = 'F';
    else if (jankPercentage > 20 || longestTaskMs > 50) grade = 'C';
    else if (jankPercentage > 10) grade = 'B';

    return {
      frameCount: frameDurationsMs.length,
      averageFps,
      jankPercentage,
      longestTaskMs,
      grade,
      isPerformant: grade === 'A' || grade === 'B'
    };
  }
}

// Standalone CLI runner
if (process.argv[1]?.endsWith('engine.mjs')) {
  const engine = new TracePulseEngine();
  console.log(JSON.stringify(engine.computeFpsScore([16.1, 16.4, 45.2, 16.2, 85.0]), null, 2));
}
