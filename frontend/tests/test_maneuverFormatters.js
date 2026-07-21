import {
  buildManeuverListLabel,
  buildManeuverSummary,
  formatMetersMadeGood
} from '../src/utils/maneuverFormatters.js';

function assertEqual(
  actual,
  expected,
  message
) {
  if (actual !== expected) {
    throw new Error(
      `${message}: expected "${expected}", got "${actual}"`
    );
  }
}

async function run() {
  assertEqual(
    formatMetersMadeGood(123.6),
    '124 m',
    'meters made good formatting'
  );

  assertEqual(
    formatMetersMadeGood(null),
    'N/A',
    'meters made good empty formatting'
  );

  assertEqual(
    buildManeuverSummary({
      headingChange: 82.4,
      speedBefore: 14.2,
      speedAfter: 13.7,
      metersMadeGood: 187.4
    }),
    'Δ heading 82.4° • speed 14.20 → 13.70 km/h • MMG 187 m',
    'maneuver summary rendering'
  );

  assertEqual(
    buildManeuverListLabel({
      type: 'Tack',
      index: 18,
      metersMadeGood: 92.2
    }),
    'Tack • point 18 • MMG 92 m',
    'maneuver list label rendering'
  );

  console.log(
    'PASS: maneuver formatter checks'
  );
}

run().catch(error => {
  console.error('FAIL:', error.message);
  process.exit(1);
});
