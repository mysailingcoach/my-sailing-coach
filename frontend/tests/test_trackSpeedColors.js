import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TRACK_COLOR,
  getSpeedColorDomain,
  getSpeedTrackColor
} from '../src/utils/trackSpeedColors.js';

test('getSpeedColorDomain returns min and max sog', () => {
  const domain = getSpeedColorDomain([
    { sog: 5.2 },
    { sog: '10.4' },
    { sog: 7.8 }
  ]);

  assert.deepEqual(domain, {
    min: 5.2,
    max: 10.4
  });
});

test('getSpeedColorDomain returns null when no valid speeds are present', () => {
  const domain = getSpeedColorDomain([
    { sog: null },
    { sog: undefined },
    { sog: 'bad' }
  ]);

  assert.equal(domain, null);
});

test('getSpeedTrackColor returns default for invalid speed inputs', () => {
  const domain = { min: 1, max: 8 };

  assert.equal(
    getSpeedTrackColor(undefined, domain),
    DEFAULT_TRACK_COLOR
  );
  assert.equal(
    getSpeedTrackColor('bad', domain),
    DEFAULT_TRACK_COLOR
  );
});

test('getSpeedTrackColor maps lower speeds to cooler colours and higher speeds to warmer colours', () => {
  const domain = { min: 2, max: 12 };

  assert.equal(
    getSpeedTrackColor(2, domain),
    '#1d4ed8'
  );
  assert.equal(
    getSpeedTrackColor(7, domain),
    '#eab308'
  );
  assert.equal(
    getSpeedTrackColor(12, domain),
    '#dc2626'
  );
});

test('getSpeedTrackColor returns stable mid colour for flat speed domains', () => {
  assert.equal(
    getSpeedTrackColor(5, { min: 5, max: 5 }),
    '#22c55e'
  );
});
