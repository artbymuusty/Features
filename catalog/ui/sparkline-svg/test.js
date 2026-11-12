import assert from 'node:assert/strict';
import test from 'node:test';
import { renderSparkline } from './index.js';

test('renderSparkline: renders valid svg for empty array', () => {
  const svg = renderSparkline([]);
  assert.match(svg, /<svg.*<\/svg>/);
});

test('renderSparkline: renders valid bezier curve path and gradient for series', () => {
  const data = [10, 40, 25, 80, 50, 95];
  const svg = renderSparkline(data, { width: 140, height: 40, strokeColor: '#10b981' });

  assert.match(svg, /viewBox="0 0 140 40"/);
  assert.match(svg, /stroke="#10b981"/);
  assert.match(svg, /linearGradient/);
  assert.match(svg, /<circle cx="/);
});

test('renderSparkline: handles single point gracefully', () => {
  const svg = renderSparkline([42]);
  assert.match(svg, /<circle cx="4" cy="18"/);
});
