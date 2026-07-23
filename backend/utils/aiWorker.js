// Lightweight AI analysis worker (rule-based)
// Produces best/worst leg and overall rating

import { segmentLegsByMarks } from './analysis/segmentLegs.js';
import { calculateLegMetrics } from './analysis/legMetrics.js';
import { calculateRating } from './analysis/ratings.js';
import { createSummary } from './analysis/summary.js';

export async function analyzeRaceAI(race) {
  const trackpoints = race.data.trackpoints || [];
  const marks = race.data.marks || [];
  const analysis = race.data.analysis || {};

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

  // Find best and worst legs by average speed
  const sorted = [...legStats].sort(
    (a, b) => b.avgSpeed - a.avgSpeed
  );

  const bestLeg = sorted[0] || null;
  const worstLeg =
    sorted.length > 0
      ? sorted[sorted.length - 1]
      : null;

  // Overall race rating
  const overallRating = calculateRating(
    analysis.avgSpeed,
    analysis.maxSpeed
  );

  // Human-readable summary
  const summary = createSummary(
    bestLeg,
    worstLeg,
    overallRating
  );

  return {
    legs: legStats,
    bestLeg,
    worstLeg,
    overallRating,
    summary
  };
}
