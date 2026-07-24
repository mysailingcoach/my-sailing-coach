export default function LegDetails({ leg, index }) {
  if (!leg) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-bold mb-2">
          Leg Details
        </h2>

        <p className="text-gray-500">
          Click a coloured leg on the map to inspect it.
        </p>
      </div>
    );
  }

  let badgeColour = "bg-red-500";

  if (leg.score >= 90) {
    badgeColour = "bg-green-600";
  } else if (leg.score >= 75) {
    badgeColour = "bg-yellow-500";
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Leg {index + 1}
        </h2>

        <span
          className={`text-white px-4 py-2 rounded-full ${badgeColour}`}
        >
          {leg.rating}
        </span>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">
            Score
          </div>

          <div className="text-3xl font-bold">
            {leg.score}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">
            Distance
          </div>

          <div className="text-3xl font-bold">
            {leg.distance.toFixed(2)} km
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">
            Avg Speed
          </div>

          <div className="text-3xl font-bold">
            {leg.avgSpeed.toFixed(2)}
          </div>

          <div className="text-xs text-gray-500">
            km/h
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">
            Max Speed
          </div>

          <div className="text-3xl font-bold">
            {leg.maxSpeed.toFixed(2)}
          </div>

          <div className="text-xs text-gray-500">
            km/h
          </div>
        </div>

      </div>

      <div className="mt-6 border rounded-lg p-4">

        <div className="text-sm text-gray-500">
          Route Efficiency
        </div>

        <div className="text-4xl font-bold">
          {leg.efficiency.toFixed(1)}%
        </div>

      </div>

    </div>
  );
}