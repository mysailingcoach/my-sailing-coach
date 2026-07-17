import React from 'react';

export default function PerformanceMetrics({ analysis }) {
  if (!analysis) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
      No analysis data available.
    </div>
  );
}
  const metrics = [
    {
      label: 'Total Distance',
      value: `${analysis.totalDistance}`,
      unit: 'km',
      icon: '📏',
      color: 'blue'
    },
    {
      label: 'Total Duration',
      value: `${analysis.totalTime.toFixed(1)}`,
      unit: 'hours',
      icon: '⏱️',
      color: 'green'
    },
    {
      label: 'Average Speed',
      value: `${analysis.avgSpeed.toFixed(1)}`,
      unit: 'km/h',
      icon: '📊',
      color: 'purple'
    },
    {
      label: 'Maximum Speed',
      value: `${analysis.maxSpeed.toFixed(1)}`,
      unit: 'km/h',
      icon: '⚡',
      color: 'orange'
    },
    {
      label: 'Minimum Speed',
      value: `${analysis.minSpeed.toFixed(1)}`,
      unit: 'km/h',
      icon: '🐢',
      color: 'red'
    },
    {
      label: 'Data Points',
      value: `${analysis.pointCount}`,
      unit: 'points',
      icon: '📍',
      color: 'indigo'
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Performance Metrics</h2>

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

      {/* AI Analysis Summary */}
      {analysis.ai && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">AI Analysis</h3>
          <p className="text-sm text-gray-700 mb-2">{analysis.ai.summary}</p>
          <div className="flex gap-4">
            <div className="flex-1 border rounded p-3">
              <div className="text-xs text-gray-600">Overall Rating</div>
              <div className="text-xl font-bold">{analysis.ai.overallRating}</div>
            </div>
            {analysis.ai.bestLeg && (
              <div className="flex-1 border rounded p-3">
                <div className="text-xs text-gray-600">Best Leg Avg Speed</div>
                <div className="text-xl font-bold">{analysis.ai.bestLeg.avgSpeed} km/h</div>
              </div>
            )}
            {analysis.ai.worstLeg && (
              <div className="flex-1 border rounded p-3">
                <div className="text-xs text-gray-600">Worst Leg Avg Speed</div>
                <div className="text-xl font-bold">{analysis.ai.worstLeg.avgSpeed} km/h</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Race Timeline</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Start Time:</span>
            <span className="font-semibold">{new Date(analysis.startTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">End Time:</span>
            <span className="font-semibold">{new Date(analysis.endTime).toLocaleString()}</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-gray-600">Total Duration:</span>
            <span className="font-semibold text-lg">{analysis.totalTime.toFixed(2)} hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
