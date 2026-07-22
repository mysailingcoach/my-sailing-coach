export function createSummary(
  bestLeg,
  worstLeg,
  overallRating
) {
  return `
Best leg avg speed ${
    bestLeg
      ? `${bestLeg.avgSpeed} km/h`
      : 'N/A'
  },
worst leg ${
    worstLeg
      ? `${worstLeg.avgSpeed} km/h`
      : 'N/A'
  }.
Overall rating: ${overallRating}.
`.trim();
}
