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
