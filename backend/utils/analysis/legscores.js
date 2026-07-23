export function scoreLegs(legStats) {
  if (!legStats.length) return [];

  const maxSpeed = Math.max(
    ...legStats.map(l => l.avgSpeed)
  );

  return legStats.map(leg => {
    const score = Math.round(
      (leg.avgSpeed / maxSpeed) * 100
    );

    let rating;

    if (score >= 90) {
      rating = 'Excellent';
    } else if (score >= 75) {
      rating = 'Good';
    } else if (score >= 60) {
      rating = 'Average';
    } else {
      rating = 'Needs Improvement';
    }

    return {
      ...leg,
      score,
      rating
    };
  });
}