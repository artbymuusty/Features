import { EventEmitter } from 'node:events';

/**
 * Resilient In-Memory Precision Job Scheduler with Absolute Drift Compensation
 */
export class PrecisionCronScheduler extends EventEmitter {
  constructor(options = {}) {
    super();
    this.jobs = new Map();
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
  }

  /**
   * Register a scheduled job
   * @param {string} id
   * @param {Function} handler
   * @param {object} options
   */
  register(id, handler, options = {}) {
    if (this.jobs.has(id)) {
      throw new Error(`Job '${id}' is already registered.`);
    }

    const job = {
      id,
      handler,
      intervalMs: options.intervalMs || 1000,
      jitterMs: options.jitterMs || 0,
      maxRetries: options.maxRetries || 3,
      running: false,
      timer: null,
      baselineTime: null,
      executionCount: 0,
      nextExpectedRun: null,
      stats: { runs: 0, successes: 0, failures: 0, lastRun: null }
    };

    this.jobs.set(id, job);
    return job;
  }

  /**
   * Start scheduling a specific job or all jobs
   */
  start(jobId = null) {
    if (jobId) {
      const job = this.jobs.get(jobId);
      if (job && !job.running) {
        job.running = true;
        job.baselineTime = Date.now();
        job.executionCount = 0;
        this._scheduleNext(job);
      }
      return;
    }

    const now = Date.now();
    for (const job of this.jobs.values()) {
      if (!job.running) {
        job.running = true;
        job.baselineTime = now;
        job.executionCount = 0;
        this._scheduleNext(job);
      }
    }
  }

  _scheduleNext(job) {
    if (!job.running) return;

    job.executionCount++;
    // Absolute timing baseline: target = baseline + (count * interval)
    const targetTime = job.baselineTime + (job.executionCount * job.intervalMs);
    const now = Date.now();

    let rawDelay = targetTime - now;
    if (rawDelay < 0) {
      // Overrun compensation: resynchronize baseline to prevent runaway bursts
      job.baselineTime = now;
      job.executionCount = 1;
      rawDelay = job.intervalMs;
    }

    const jitter = job.jitterMs > 0 ? (Math.random() * job.jitterMs) : 0;
    const delay = Math.max(0, Math.round(rawDelay + jitter));
    job.nextExpectedRun = now + delay;

    job.timer = setTimeout(async () => {
      await this.runNow(job.id);
      if (job.running) {
        this._scheduleNext(job);
      }
    }, delay);
  }

  /**
   * Manually execute a job immediately
   */
  async runNow(id) {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.stats.runs++;
    job.stats.lastRun = Date.now();
    const startTime = Date.now();

    let attempt = 0;
    let success = false;
    let lastError = null;

    while (attempt <= job.maxRetries && !success) {
      attempt++;
      try {
        await job.handler();
        success = true;
        job.stats.successes++;
        this.emit('success', { id, attempt, durationMs: Date.now() - startTime });
      } catch (err) {
        lastError = err;
        if (attempt <= job.maxRetries) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, Math.min(200 * Math.pow(2, attempt - 1), 1000)));
        }
      }
    }

    if (!success) {
      job.stats.failures++;
      this.emit('failure', { id, attempts: attempt, error: lastError });
    }

    this._recordHistory({
      id,
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      success,
      error: lastError?.message || null
    });

    return { success, attempts: attempt, durationMs: Date.now() - startTime };
  }

  _recordHistory(record) {
    this.history.push(record);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Stop one or all scheduled jobs
   */
  stop(jobId = null) {
    if (jobId) {
      const job = this.jobs.get(jobId);
      if (job) {
        job.running = false;
        if (job.timer) clearTimeout(job.timer);
      }
      return;
    }

    for (const job of this.jobs.values()) {
      job.running = false;
      if (job.timer) clearTimeout(job.timer);
    }
  }

  getJob(id) {
    return this.jobs.get(id) || null;
  }
}
