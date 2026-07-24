function formatNumber(value, decimals = 1) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "N/A";
  }

  return Number(value).toFixed(decimals);
}

export default function RaceStats({ analysis }) {
  if (!analysis) {
    return (
      <div className="bg-red-100 p-4 rounded">
        No analysis available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500">Distance</p>
        <h2 className="text-3xl font-bold">
          {formatNumber(analysis.totalDistance)} km
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500">Average Speed</p>
        <h2 className="text-3xl font-bold">
          {formatNumber(analysis.avgSpeed)} km/h
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500">Maximum Speed</p>
        <h2 className="text-3xl font-bold">
          {formatNumber(analysis.maxSpeed)} km/h
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500">Performance</p>
        <h2 className="text-3xl font-bold">
          {formatNumber(analysis.performanceIndex?.score, 0)}/100
        </h2>
      </div>

    </div>
  );
}