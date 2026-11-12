import assert from 'node:assert/strict';
import test from 'node:test';
import { createGitBranch, scaffoldFeature, assertValidFeatureId } from '../src/contributor.js';

test('Security: assertValidFeatureId rejects dangerous and malformed IDs', () => {
  const maliciousIds = [
    'test; echo PWNED',
    'test && rm -rf /',
    'test | cat /etc/passwd',
    '$(whoami)',
    '`id`',
    '../../etc/passwd',
    '/root/secret',
    'test/nested',
    'test\\windows',
    'test space',
    'UPPERCASE-FEATURE',
    'test_underscore',
    'test..dotdot',
    '%2e%2e%2fmalicious',
    '',
    '   ',
    '-starting-hyphen',
    'ending-hyphen-',
    'double--hyphen'
  ];

  for (const id of maliciousIds) {
    assert.throws(
      () => assertValidFeatureId(id),
      /Invalid feature ID|Feature ID is required/,
      `Expected assertValidFeatureId to reject: ${id}`
    );
  }
});

test('Security: createGitBranch rejects shell command injection attempts without executing', () => {
  const injectionPayloads = [
    'vuln; touch /tmp/features-pwned-1',
    'vuln && touch /tmp/features-pwned-2',
    'vuln | touch /tmp/features-pwned-3',
    '$(touch /tmp/features-pwned-4)'
  ];

  for (const payload of injectionPayloads) {
    assert.throws(
      () => createGitBranch(payload),
      /Invalid feature ID/
    );
  }
});

test('Security: scaffoldFeature prevents path traversal outside catalog', () => {
  const traversalAttempts = [
    '../../escaped-dir',
    '../sibling',
    '/tmp/absolute-escape',
    'nested/path/attempt'
  ];

  for (const target of traversalAttempts) {
    assert.throws(
      () => scaffoldFeature(target, { category: 'workflow' }),
      /Invalid feature ID/
    );
  }
});

test('Security: scaffoldFeature rejects invalid categories', () => {
  assert.throws(
    () => scaffoldFeature('valid-id', { category: 'invalid-nonexistent-cat' }),
    /Invalid category/
  );
});
