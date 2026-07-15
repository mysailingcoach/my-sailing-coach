import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../api/client';

export default function Dashboard() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await axios.get(getApiUrl('/races'));
        setRaces(response.data);
      } catch (err) {
        setError('Failed to load races');
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this race?')) return;

    try {
      await axios.delete(getApiUrl(`/races/${id}`));
      setRaces(races.filter(race => race.id !== id));
    } catch (err) {
      alert('Failed to delete race');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your races...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Races</h1>
        <p className="text-gray-600">Review and analyze your sailing races</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}

      {races.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <p className="text-xl text-gray-700 mb-4">No races uploaded yet</p>
          <p className="text-gray-600 mb-6">Start by uploading your first GPX file to analyze your sailing performance.</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
            Upload Your First Race
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {races.map(race => (
            <div key={race.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{race.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {new Date(race.uploadDate || race.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/race/${race.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-center transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(race.id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
