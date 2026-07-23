import {
  segmentLegsByMarks
} from './segmentLegs.js';

import {
  calculateLegMetrics
} from './legMetrics.js';

import {
  calculateRating
} from './ratings.js';

import {
  createSummary
} from './summary.js';

export async function analyzeRaceAI(
  race
) {
  const trackpoints =
    race.data.trackpoints || [];

  const marks =
    race.data.marks || [];

  const legs =
    segmentLegsByMarks(
      trackpoints,
      marks
    );

  const legStats =
    calculateLegMetrics(
      trackpoints,
      legs
    );

const insights =
  generateInsights(
    legStats
  );

const recommendations =
  generateRecommendations(
    insights
  );

  const sorted = [...legStats].sort(
    (a, b) =>
      b.avgSpeed - a.avgSpeed
  );

  const bestLeg =
    sorted[0] || null;

  const worstLeg =
    sorted[
      sorted.length - 1
    ] || null;

  const overallRating =
    calculateRating(
      race.data.analysis
        ?.avgSpeed,
      race.data.analysis
        ?.maxSpeed
    );

  const summary =
    createSummary(
      bestLeg,
      worstLeg,
      overallRating
    );

  return {
  legs: legStats,

  bestLeg,
  worstLeg,

  insights,
  recommendations,

  overallRating,
  summary
};
}
