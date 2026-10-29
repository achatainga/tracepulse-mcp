import assert from 'node:assert';
import { TracePulseEngine } from '../src/engine.mjs';

async function runAllTests() {
  console.log('🧪 Starting TracePulse MCP Live Test Gauntlet...');
  const engine = new TracePulseEngine();

  // Test 1: Re-render storm detection
  console.log('\n[Test 1] Detecting infinite/excessive re-render storms...');
  const stormEvents = Array.from({ length: 25 }).map((_, i) => ({
    component: 'UserProfileCard',
    durationMs: 4,
    cause: 'useEffect state mutation loop'
  }));

  const renderProfile = engine.profileRenderLifecycle(stormEvents, 1000);
  assert.strictEqual(renderProfile.hasSevereDegradation, true);
  assert.strictEqual(renderProfile.issues.length, 1);
  assert.strictEqual(renderProfile.issues[0].component, 'UserProfileCard');
  assert.strictEqual(renderProfile.issues[0].type, 'RE_RENDER_STORM');
  console.log('  ✅ Successfully flagged re-render storm: 25 renders/sec on UserProfileCard');

  // Test 2: Unmounted timer / rAF resource leak detection
  console.log('\n[Test 2] Detecting uncleaned timer/rAF leaks on unmount...');
  const leakingLifecycle = [
    { action: 'allocate', kind: 'interval', component: 'StockTicker' },
    { action: 'allocate', kind: 'raf', component: 'StockTicker' },
    // Forgot to clear before unmounting!
    { action: 'unmount', component: 'StockTicker' }
  ];

  const leakProfile = engine.detectRafMemoryLeaks(leakingLifecycle);
  assert.strictEqual(leakProfile.hasLeaks, true);
  assert.strictEqual(leakProfile.totalLeaks, 1);
  assert.strictEqual(leakProfile.leaks[0].leakedResources.interval, 1);
  assert.strictEqual(leakProfile.leaks[0].leakedResources.raf, 1);
  console.log('  ✅ Caught unmounted leaks: 1 interval, 1 rAF handle unreleased.');

  // Test 3: Clean component lifecycle passes with zero leaks
  console.log('\n[Test 3] Verifying clean component lifecycle passes with 0 leaks...');
  const cleanLifecycle = [
    { action: 'allocate', kind: 'interval', component: 'TimerWidget' },
    { action: 'cleanup', kind: 'interval', component: 'TimerWidget' },
    { action: 'unmount', component: 'TimerWidget' }
  ];
  const cleanProfile = engine.detectRafMemoryLeaks(cleanLifecycle);
  assert.strictEqual(cleanProfile.hasLeaks, false);
  assert.strictEqual(cleanProfile.totalLeaks, 0);
  console.log('  ✅ Clean lifecycle verified with zero detected leaks.');

  // Test 4: FPS and jank metric scoring
  console.log('\n[Test 4] Computing FPS and interaction jank metrics...');
  const frameTimes = [16.2, 16.5, 16.1, 75.0, 16.3, 110.0, 16.4]; // 2 heavy jank spikes
  const fpsResult = engine.computeFpsScore(frameTimes);
  assert.ok(fpsResult.longestTaskMs >= 110.0);
  assert.ok(fpsResult.jankPercentage > 20);
  assert.strictEqual(fpsResult.isPerformant, false);
  console.log(`  ✅ Jank detection verified: Longest task ${fpsResult.longestTaskMs}ms, Grade ${fpsResult.grade}`);

  console.log('\n🎉 ALL 4 GAUNTLET TESTS PASSED WITH 100% SUCCESS RATE!');
}

runAllTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
