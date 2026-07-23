export function calculateEfficiency(
  actualDistance,
  directDistance
) {
  if (!actualDistance) {
    return 0;
  }

  return directDistance / actualDistance;
}