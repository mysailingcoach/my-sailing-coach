import { segmentLegsByMarks } from './segmentLegs.js';
import { calculateLegMetrics } from './legMetrics.js';
import { calculateRating } from './ratings.js';
import { createSummary } from './summary.js';

export async function analyzeRaceAI(race) {
  const trackpoints = race?.data?.trackpoints || [];
  const marks = race?.data?.marks || [];
  const analysis = race?.data?.analysis || {};

  // Handle empty or invalid races
  if (!trackpoints.length) {
    return {
      legs: [],
      bestLeg: null,
      worstLeg: null,
      overallRating: 'Unknown',
      summary: 'No trackpoints available.'
    };
  }

  // Split race into legs
  const legs = segmentLegsByMarks(
    trackpoints,
    marks
  );

  // Calculate metrics for each leg
  const legStats = calculateLegMetrics(
    trackpoints,
    legs
  );

<<<<<<< HEAD
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
=======
  // Rank legs by average speed
  const sortedLegs = [...legStats].sort(
    (a, b) => b.avgSpeed - a.avgSpeed
>>>>>>> 29fdf5b03ae3fd101889e3e30192f733683dd722
  );

  const bestLeg =
    sortedLegs.length > 0
      ? sortedLegs[0]
      : null;

  const worstLeg =
    sortedLegs.length > 0
      ? sortedLegs[sortedLegs.length - 1]
      : null;

  // Generate overall rating
  const overallRating = calculateRating(
    analysis.avgSpeed,
    analysis.maxSpeed
  );

  // Generate summary text
  const summary = createSummary(
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
