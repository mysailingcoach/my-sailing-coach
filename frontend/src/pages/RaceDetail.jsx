import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RaceMap from '../components/RaceMap';
import PerformanceMetrics from '../components/PerformanceMetrics';
import { getApiUrl } from '../api/client';

export default function RaceDetail() {
  const { id } = useParams();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRace = async () => {
      try {
        const response = await axios.get(getApiUrl(`/races/${id}`));
        setRace(response.data);
      } catch (err) {
        setError('Failed to load race data');
      } finally {
        setLoading(false);
      }
    };

    fetchRace();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading race data...</p>
        </div>
      </div>
    );
  }

  if (error || !race) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        {error || 'Race not found'}
      </div>
    );
  }

  const data = race.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{race.name}</h1>
        <p className="text-gray-600">
          Uploaded: {new Date(race.uploadDate).toLocaleDateString()} at {new Date(race.uploadDate).toLocaleTimeString()}
        </p>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <RaceMap trackpoints={data.trackpoints} marks={data.marks || []} />
      </div>

      {/* Metrics */}
      <PerformanceMetrics analysis={data.analysis} />

      {/* Raw Data Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Route Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Point #</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Latitude</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Longitude</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Elevation (m)</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.trackpoints.slice(0, 50).map((point, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{point.index + 1}</td>
                  <td className="px-4 py-2">{point.lat.toFixed(6)}</td>
                  <td className="px-4 py-2">{point.lon.toFixed(6)}</td>
                  <td className="px-4 py-2">{point.ele.toFixed(1)}</td>
                  <td className="px-4 py-2 text-xs">{new Date(point.time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.trackpoints.length > 50 && (
            <p className="text-sm text-gray-600 p-4">Showing 50 of {data.trackpoints.length} points</p>
          )}
        </div>
      </div>
    </div>
  );
}
