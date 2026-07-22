export function calculateRating(
  avgSpeed,
  maxSpeed
) {
  if (!avgSpeed || !maxSpeed) {
    return 'Unknown';
  }

  const ratio =
    avgSpeed / maxSpeed;

  if (ratio > 0.85)
    return 'Excellent';

  if (ratio > 0.7)
    return 'Good';

  if (ratio > 0.5)
    return 'Average';

  return 'Needs Improvement';
}
