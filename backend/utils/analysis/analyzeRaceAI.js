import { segmentLegsByMarks } from './segmentLegs.js';
import { calculateLegMetrics } from './legMetrics.js';
import { calculateRating } from './ratings.js';
import { createSummary } from './summary.js';
import { scoreLegs } from './legScores.js';
import { generateInsights } from './insights.js';
import { generateRecommendations } from './recommendations.js';

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
      summary: 'No trackpoints available.',
      insights: [],
      recommendations: []
    };
  }

  // Split race into legs
  const legs = segmentLegsByMarks(
    trackpoints,
    marks
  );

  // Calculate metrics
  const legStats = calculateLegMetrics(
    trackpoints,
    legs
  );
  
const scoredLegs = scoreLegs(legStats);

  // Generate insights
  const insights = generateInsights(
    scoredLegs
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    insights
  );

  // Rank legs by average speed
  const sortedLegs = [...scoredLegs].sort(
    (a, b) => b.score - a.score
  );

  const bestLeg =
    sortedLegs.length > 0
      ? sortedLegs[0]
      : null;

  const worstLeg =
    sortedLegs.length > 0
      ? sortedLegs[sortedLegs.length - 1]
      : null;

  // Overall rating
  const overallRating = calculateRating(
    analysis.avgSpeed,
    analysis.maxSpeed
  );

  // Summary
  const summary = createSummary(
    bestLeg,
    worstLeg,
    overallRating,
    insights
  );

  return {
    legs: scoredLegs,
    bestLeg,
    worstLeg,
    overallRating,
    summary,
    insights,
    recommendations
  };
}