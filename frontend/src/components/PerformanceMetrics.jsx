import React from 'react';

export default function PerformanceMetrics({ analysis, comparative }) {
  const formatNumber = (value, decimals = 1) => {
    return value != null && !isNaN(value)
      ? Number(value).toFixed(decimals)
      : 'N/A';
  };

  if (!analysis) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        No analysis data available.
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Distance',
      value: analysis.totalDistance ?? 'N/A',
      unit: 'km',
      icon: '📏',
      color: 'blue'
    },
    {
      label: 'Total Duration',
      value: formatNumber(analysis.totalTime),
      unit: 'hours',
      icon: '⏱️',
      color: 'green'
    },
    {
      label: 'Average Speed',
      value: formatNumber(analysis.avgSpeed),
      unit: 'km/h',
      icon: '📊',
      color: 'purple'
    },
    {
      label: 'Maximum Speed',
      value: formatNumber(analysis.maxSpeed),
      unit: 'km/h',
      icon: '⚡',
      color: 'orange'
    },
    {
      label: 'Performance Index',
      value: formatNumber(analysis.performanceIndex?.score),
      unit: '/100',
      icon: '🏁',
      color: 'indigo'
    },
    {
      label: 'Maneuvers',
      value: analysis.maneuverSummary?.total ?? 0,
      unit: 'events',
      icon: '🔄',
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  };

  const legRows = (analysis.legs || []).slice(0, 12);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Performance Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-6 ${colorClasses[metric.color]}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-3xl">{metric.icon}</div>

              <div className="text-right">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs">{metric.unit}</p>
              </div>
            </div>

            <p className="text-sm font-semibold">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Advanced Sailing Metrics
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">VMG (avg / max)</span>
              <span className="font-semibold">
                {formatNumber(analysis.vmg?.avg, 2)} / {formatNumber(analysis.vmg?.max, 2)} km/h
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">TWA (avg)</span>
              <span className="font-semibold">
                {formatNumber(analysis.twa?.avg, 1)}°
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">SOG vs True Speed</span>
              <span className="font-semibold">
                {formatNumber(analysis.sogVsTrueSpeed?.avgSog, 2)} / {formatNumber(analysis.sogVsTrueSpeed?.estimatedTrueSpeed, 2)} km/h
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Heading Consistency</span>
              <span className="font-semibold">
                {formatNumber(analysis.headingAnalysis?.consistencyScore, 1)}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Start Timing Score</span>
              <span className="font-semibold">
                {formatNumber(analysis.startLine?.startTimingScore, 1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Comparative Analytics
          </h3>

          {comparative?.hasHistory ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Historical races</span>
                <span className="font-semibold">{comparative.historyCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg speed delta</span>
                <span className={`font-semibold ${comparative.delta?.avgSpeed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparative.delta?.avgSpeed >= 0 ? '+' : ''}
                  {formatNumber(comparative.delta?.avgSpeed, 2)} km/h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performance index delta</span>
                <span className={`font-semibold ${comparative.delta?.performanceIndex >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparative.delta?.performanceIndex >= 0 ? '+' : ''}
                  {formatNumber(comparative.delta?.performanceIndex, 1)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-gray-600">Personal best segment</div>
                <div className="font-semibold">
                  {comparative.personalBestSegment?.type || 'N/A'} ({formatNumber(comparative.personalBestSegment?.avgSpeed, 2)} km/h)
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Upload more races to unlock historical trend comparisons.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Leg Analysis
        </h3>

        {legRows.length === 0 ? (
          <p className="text-sm text-gray-600">
            No leg data available for this race.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-800">
  <thead className="bg-gray-100 text-gray-900">
    <tr>
      <th className="px-3 py-2 text-left">Leg</th>
      <th className="px-3 py-2 text-left">Type</th>
      <th className="px-3 py-2 text-left">Duration (h)</th>
      <th className="px-3 py-2 text-left">Distance (km)</th>
      <th className="px-3 py-2 text-left">Avg Speed</th>
    </tr>
  </thead>
  ...
</table>
              <tbody>
                {legRows.map((leg, idx) => (
                  <tr key={`${leg.startIndex}-${leg.endIndex}`} className="border-b">
                    <td className="px-3 py-2">#{idx + 1}</td>
                    <td className="px-3 py-2">{leg.type}</td>
                    <td className="px-3 py-2">{formatNumber(leg.durationHours, 2)}</td>
                    <td className="px-3 py-2">{formatNumber(leg.distance, 2)}</td>
                    <td className="px-3 py-2">{formatNumber(leg.avgSpeed, 2)} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Maneuver Analysis
        </h3>

        {(analysis.maneuvers || []).length === 0 ? (
          <p className="text-sm text-gray-600">
            No tacks or gybes detected.
          </p>
        ) : (
          <div className="space-y-3">
            {(analysis.maneuvers || []).slice(0, 12).map((maneuver, idx) => (
              <div key={`${maneuver.index}-${idx}`} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {maneuver.type} at point {maneuver.index}
                  </div>
                  <div className="text-xs text-gray-600">
                    Δ heading {formatNumber(maneuver.headingChange, 1)}° • speed {formatNumber(maneuver.speedBefore, 2)} → {formatNumber(maneuver.speedAfter, 2)} km/h
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Efficiency</div>
                  <div className="font-semibold">{formatNumber(maneuver.efficiencyScore * 100, 0)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {analysis?.report && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Automated Sailing Report
          </h3>
          <p className="text-sm text-gray-700 mb-2">
            {analysis.report.summary}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {analysis.report.weatherSummary}
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {(analysis.report.recommendations || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Race Timeline
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Start Time:</span>

            <span className="font-semibold">
              {analysis.startTime
                ? new Date(analysis.startTime).toLocaleString()
                : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">End Time:</span>

            <span className="font-semibold">
              {analysis.endTime
                ? new Date(analysis.endTime).toLocaleString()
                : 'N/A'}
            </span>
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-gray-600">Total Duration:</span>

            <span className="font-semibold text-lg">
              {formatNumber(analysis.totalTime, 2)} hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
