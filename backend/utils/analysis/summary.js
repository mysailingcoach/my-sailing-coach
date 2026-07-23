export function createSummary(
  bestLeg,
  worstLeg,
  overallRating,
  insights
) {
  const opportunities =
    insights.filter(
      i => i.type === 'opportunity'
    ).length;

  return `
Best leg average speed:
${bestLeg?.avgSpeed ?? 'N/A'} km/h.

Worst leg average speed:
${worstLeg?.avgSpeed ?? 'N/A'} km/h.

Overall rating:
${overallRating}.

Areas for improvement:
${opportunities}
`.trim();
}
