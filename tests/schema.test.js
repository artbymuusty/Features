import assert from 'node:assert/strict';
import test from 'node:test';
import { validateFeature } from '../src/validator.js';

test('Schema Validator: accepts fully valid feature metadata', () => {
  const valid = {
    id: "test-auth-module",
    name: "Test Auth Module",
    version: "1.2.0",
    summary: "A robust authentication verification module for testing",
    category: "auth",
    tags: ["auth", "security"],
    technologies: ["javascript", "node"],
    maturity: "stable",
    dependencies: {},
    license: "MIT",
    author: {
      name: "Tester",
      github: "tester"
    }
  };

  const res = validateFeature(valid);
  assert.equal(res.valid, true);
  assert.equal(res.errors.length, 0);
});

test('Schema Validator: rejects invalid id format', () => {
  const invalid = {
    id: "INVALID_ID_WITH_CAPS",
    name: "Invalid ID",
    version: "1.0.0",
    summary: "Invalid kebab case identifier test",
    category: "auth",
    tags: ["auth"],
    technologies: ["javascript"],
    maturity: "stable",
    dependencies: {},
    license: "MIT",
    author: { name: "Tester" }
  };

  const res = validateFeature(invalid);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some(e => e.includes('kebab-case')));
});

test('Schema Validator: rejects invalid category and maturity enums', () => {
  const invalid = {
    id: "test-cat",
    name: "Invalid Enum",
    version: "1.0.0",
    summary: "Testing invalid enum validation for schema",
    category: "unknown-category",
    tags: ["tag1"],
    technologies: ["node"],
    maturity: "super-stable",
    dependencies: {},
    license: "MIT",
    author: { name: "Tester" }
  };

  const res = validateFeature(invalid);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some(e => e.includes("'category' must be one of")));
  assert.ok(res.errors.some(e => e.includes("'maturity' must be one of")));
});
