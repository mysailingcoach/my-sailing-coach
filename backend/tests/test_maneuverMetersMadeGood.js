import {
  computeAdvancedAnalysis,
  computeManeuverTargetDirection,
  computeMetersMadeGoodAfterManeuver
} from '../utils/gpxParser.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertApprox(
  actual,
  expected,
  tolerance,
  message
) {
  if (
    Math.abs(actual - expected) > tolerance
  ) {
    throw new Error(
      `${message}: expected ${expected} ±${tolerance}, got ${actual}`
    );
  }
}

function buildTrackpoints({
  headings,
  latStep,
  windDirection = null
}) {
  return headings.map((heading, index) => ({
    lat: index * latStep,
    lon: 0,
    index,
    heading,
    sog: 18,
    time: new Date(
      Date.UTC(2024, 0, 1, 0, 0, index)
    ).toISOString(),
    wind:
      windDirection == null
        ? undefined
        : {
            direction: windDirection,
            speed: 12
          }
  }));
}

async function run() {
  const tackTrackpoints = buildTrackpoints({
    headings: [
      320,
      320,
      320,
      320,
      320,
      300,
      40,
      40,
      40,
      40,
      40,
      40
    ],
    latStep: 0.001
  });
  const tackAnalysis =
    computeAdvancedAnalysis(tackTrackpoints);
  const tack = tackAnalysis.maneuvers[0];

  assert(tack, 'expected tack maneuver');
  assert(
    tack.type === 'Tack',
    `expected Tack, got ${tack?.type}`
  );
  assertApprox(
    tack.targetCourseDirection,
    0,
    0.2,
    'tack target course direction'
  );
  assertApprox(
    tack.metersMadeGood,
    556,
    15,
    'tack meters made good'
  );

  const gybeTrackpoints = buildTrackpoints({
    headings: [
      110,
      110,
      110,
      110,
      110,
      280,
      250,
      250,
      250,
      250,
      250,
      250
    ],
    latStep: -0.001
  });
  const gybeAnalysis =
    computeAdvancedAnalysis(gybeTrackpoints);
  const gybe = gybeAnalysis.maneuvers[0];

  assert(gybe, 'expected gybe maneuver');
  assert(
    gybe.type === 'Gybe',
    `expected Gybe, got ${gybe?.type}`
  );
  assertApprox(
    gybe.targetCourseDirection,
    180,
    0.2,
    'gybe target course direction'
  );
  assertApprox(
    gybe.metersMadeGood,
    556,
    15,
    'gybe meters made good'
  );

  assert(
    computeManeuverTargetDirection([], 5) == null,
    'expected null target direction with insufficient points'
  );

  const ambiguousTrackpoints = buildTrackpoints({
    headings: [
      90,
      90,
      90,
      90,
      90,
      0,
      270,
      270,
      270,
      270,
      270,
      270
    ],
    latStep: 0.001
  });

  assert(
    computeManeuverTargetDirection(
      ambiguousTrackpoints,
      5
    ) == null,
    'expected null target direction for ambiguous opposite headings'
  );

  const invalidHeadingTrackpoints =
    buildTrackpoints({
      headings: [
        null,
        null,
        null,
        null,
        null,
        0,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      latStep: 0.001
    });

  assert(
    computeManeuverTargetDirection(
      invalidHeadingTrackpoints,
      5
    ) == null,
    'expected null target direction for invalid headings'
  );

  assert(
    computeMetersMadeGoodAfterManeuver(
      tackTrackpoints,
      5,
      null
    ) == null,
    'expected null meters made good without target direction'
  );

  console.log(
    'PASS: maneuver meters made good checks'
  );
}

run().catch(error => {
  console.error('FAIL:', error.message);
  process.exit(1);
});
