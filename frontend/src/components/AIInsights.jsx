export default function AIInsights({ ai }) {
  if (!ai) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-bold mb-2">
          🤖 AI Coach
        </h2>

        <p className="text-gray-500">
          No AI analysis available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">

      <h2 className="text-2xl font-bold mb-4">
        🤖 AI Coach
      </h2>

      <div className="mb-6">
        <h3 className="font-semibold">
          Overall Rating
        </h3>

        <p className="text-lg">
          {ai.overallRating}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold">
          Summary
        </h3>

        <p className="whitespace-pre-line">
          {ai.summary}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">
          Insights
        </h3>

        <ul className="space-y-2">
          {ai.insights?.map((item, index) => (
            <li
              key={index}
              className="border rounded p-3"
            >
              <strong>{item.type}</strong>

              <div>{item.message}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-2">
          Recommendations
        </h3>

        <ul className="space-y-2">
          {ai.recommendations?.map((item, index) => (
            <li
              key={index}
              className="border rounded p-3"
            >
              <strong>{item.title}</strong>

              <div>{item.impact}</div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}