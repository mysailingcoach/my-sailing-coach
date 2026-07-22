// Lightweight AI analysis worker (rule-based) to produce best/worst leg and overall rating
import { segmentLegsByMarks } from './analysis/segmentLegs.js';
import { calculateRating } from './analysis/ratings.js';
import { createSummary } from './analysis/summary.js';

export async function analyzeRaceAI(race) {
  const trackpoints = race.data.trackpoints || [];
  const marks = race.data.marks || [];

  const legs = segmentLegsByMarks(trackpoints, marks);
  const legStats = [];

  for (const leg of legs) {
    let dist = 0;
    let timeHours = 0;
    let speeds = [];
    for (let i = leg.start + 1; i <= leg.end; i++) {
      const prev = trackpoints[i - 1];
      const curr = trackpoints[i];
      dist += calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
      if (prev.time && curr.time) {
        const dt = (new Date(curr.time) - new Date(prev.time)) / 1000 / 3600;
        if (dt > 0) {
          timeHours += dt;
          speeds.push((calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon) / dt));
        }
      }
    }
    const avgSpeed = speeds.length ? (speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
    legStats.push({ start: leg.start, end: leg.end, distance: parseFloat(dist.toFixed(2)), avgSpeed: parseFloat(avgSpeed.toFixed(2)) });
  }

  // pick best and worst legs by avgSpeed
  const sorted = [...legStats].sort((a, b) => b.avgSpeed - a.avgSpeed);
  const bestLeg = sorted[0] || null;
  const worstLeg = sorted[sorted.length - 1] || null;

  // overall rating: simple heuristic using avgSpeed vs maxSpeed
  const analysis = race.data.analysis || {};
  const overallRating = (() => {
    if (!analysis.avgSpeed || !analysis.maxSpeed) return 'Unknown';
    const ratio = analysis.avgSpeed / analysis.maxSpeed;
    if (ratio > 0.85) return 'Excellent';
    if (ratio > 0.7) return 'Good';
    if (ratio > 0.5) return 'Average';
    return 'Needs Improvement';
  })();

  const summary = `Best leg avg speed ${bestLeg ? bestLeg.avgSpeed + ' km/h' : 'N/A'}, worst leg ${worstLeg ? worstLeg.avgSpeed + ' km/h' : 'N/A'}. Overall rating: ${overallRating}.`;

  return {
    legs: legStats,
    bestLeg,
    worstLeg,
    overallRating,
    summary
  };
}
