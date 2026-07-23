export function generateRecommendations(
  insights
) {
  const recommendations = [];

  const hasEfficiencyIssue =
    insights.some(
      i => i.type === 'opportunity'
    );

  if (hasEfficiencyIssue) {
    recommendations.push({
      priority: 1,
      title:
        'Reduce extra distance sailed',
      impact:
        'Potential gain from tighter routing'
    });
  }

  return recommendations;
}