export function generateInsights(
  legStats
) {
  const insights = [];

  for (const leg of legStats) {
    if (leg.efficiency >= 95) {
      insights.push({
        type: 'strength',
        severity: 'low',
        message: `Leg efficiency was excellent at ${leg.efficiency}%`
      });
    }

    if (leg.efficiency < 85) {
      insights.push({
        type: 'opportunity',
        severity: 'medium',
        message: `Leg efficiency was only ${leg.efficiency}%`
      });
    }
  }

  return insights;
}