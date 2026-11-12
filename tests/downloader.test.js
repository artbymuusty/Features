import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { downloadFeature } from '../src/downloader.js';

const TEST_BASE = '/tmp/features-downloader-test';

test('Downloader: extracts package cleanly and prevents partial writes on failure', () => {
  fs.mkdirSync(TEST_BASE, { recursive: true });
  const targetDir = path.join(TEST_BASE, 'my-kv');

  try {
    // 1. Clean download
    const res = downloadFeature('sqlite-kv-store', targetDir);
    assert.equal(res.success, true);
    assert.ok(res.filesCopied.includes('index.js'));
    assert.ok(fs.existsSync(path.join(targetDir, 'index.js')));

    // 2. Overwrite blocked by default
    assert.throws(
      () => downloadFeature('sqlite-kv-store', targetDir, { overwrite: false }),
      /already exists and is not empty/
    );

    // 3. Overwrite allowed with flag
    const resOverwrite = downloadFeature('sqlite-kv-store', targetDir, { overwrite: true });
    assert.equal(resOverwrite.success, true);

    // 4. Unknown feature fails and creates nothing
    const ghostDir = path.join(TEST_BASE, 'ghost-target');
    assert.throws(
      () => downloadFeature('non-existent-feature', ghostDir),
      /not found in catalog/
    );
    assert.equal(fs.existsSync(ghostDir), false, 'Target should not be created for missing feature');
  } finally {
    fs.rmSync(TEST_BASE, { recursive: true, force: true });
  }
});
