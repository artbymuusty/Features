import assert from 'node:assert/strict';
import test from 'node:test';
import { PrecisionCronScheduler } from './index.js';

test('PrecisionCronScheduler: executes registered job and records stats', async () => {
  const scheduler = new PrecisionCronScheduler();
  let count = 0;

  scheduler.register('counter', async () => {
    count++;
  }, { intervalMs: 30 });

  scheduler.start('counter');
  await new Promise(r => setTimeout(r, 85));
  scheduler.stop('counter');

  assert.ok(count >= 2, `Expected at least 2 runs, got ${count}`);
  const job = scheduler.getJob('counter');
  assert.ok(job.stats.runs >= 2);
  assert.equal(job.stats.failures, 0);
});

test('PrecisionCronScheduler: drift compensation maintains target timeline despite execution lag', async () => {
  const scheduler = new PrecisionCronScheduler();
  const timestamps = [];
  const start = Date.now();

  scheduler.register('drift-test', async () => {
    timestamps.push(Date.now() - start);
    // Simulate task taking 15ms of work
    await new Promise(r => setTimeout(r, 15));
  }, { intervalMs: 50 });

  scheduler.start('drift-test');
  await new Promise(r => setTimeout(r, 170));
  scheduler.stop('drift-test');

  // Should have executed ~3 times within ~170ms
  assert.ok(timestamps.length >= 3, `Expected at least 3 runs, got ${timestamps.length}: ${timestamps.join(', ')}`);
  
  // Verify timestamps are spaced approximately by interval (50ms) rather than (50ms + 15ms work = 65ms)
  const diff1 = timestamps[1] - timestamps[0];
  const diff2 = timestamps[2] - timestamps[1];
  
  assert.ok(diff1 >= 40 && diff1 <= 65, `Expected interval ~50ms, got ${diff1}ms`);
  assert.ok(diff2 >= 40 && diff2 <= 65, `Expected interval ~50ms, got ${diff2}ms`);
});

test('PrecisionCronScheduler: retries with backoff upon failure', async () => {
  const scheduler = new PrecisionCronScheduler();
  let attempts = 0;

  scheduler.register('failing-task', async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Temporary glitch');
    }
  }, { maxRetries: 3 });

  const result = await scheduler.runNow('failing-task');
  assert.equal(result.success, true);
  assert.equal(attempts, 3);
});

test('PrecisionCronScheduler: records terminal failure when retries exhausted', async () => {
  const scheduler = new PrecisionCronScheduler();
  scheduler.register('terminal-error', async () => {
    throw new Error('Permanent failure');
  }, { maxRetries: 1 });

  const result = await scheduler.runNow('terminal-error');
  assert.equal(result.success, false);
  const job = scheduler.getJob('terminal-error');
  assert.equal(job.stats.failures, 1);
});
