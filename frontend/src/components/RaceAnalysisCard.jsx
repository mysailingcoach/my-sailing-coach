export default function RaceAnalysisCard({ analysis }) {
  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-black mb-4">
        Race Analysis
      </h2>

      <div className="space-y-4">

        <div>
          <p className="text-sm text-gray-500">
            Overall Rating
          </p>

          <p className="text-xl font-bold">
            {analysis.overallRating || "Unknown"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Summary
          </p>

          <p>
            {analysis.summary || "No summary available."}
          </p>
        </div>

      </div>
    </div>
  );
}