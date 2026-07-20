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
      <div className="flex flex-col justify-center items-center h-96 gap-5 animate-fade-in">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(59,130,246,0.3)', borderTopColor: '#3b82f6' }}
        />
        <p style={{ color: 'var(--color-text-muted)' }}>Loading your races…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div
        className="rounded-2xl p-8 animate-slide-up"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h1 className="text-3xl font-bold mb-1">Your Races</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Review and analyze your sailing performance</p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-5 py-4 text-sm animate-scale-in"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {races.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center animate-slide-up-1"
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed rgba(59,130,246,0.3)',
          }}
        >
          <div className="text-5xl mb-5 animate-float inline-block">⛵</div>
          <p className="text-xl font-semibold mb-2">No races uploaded yet</p>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Start by uploading your first GPX file to analyze your sailing performance.
          </p>
          <Link
            to="/"
            className="btn-gradient inline-flex px-6 py-3 rounded-xl text-sm font-bold"
          >
            Upload Your First Race
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {races.map((race, i) => (
            <div
              key={race.id}
              className="card animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-base font-bold leading-snug">{race.name}</h3>
                <span className="badge badge-blue shrink-0">
                  ⛵
                </span>
              </div>

              <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
                {new Date(race.uploadDate || race.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </p>

              <div className="flex gap-2">
                <Link
                  to={`/race/${race.id}`}
                  className="btn-gradient flex-1 py-2 rounded-lg text-sm text-center font-semibold"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(race.id)}
                  className="btn-danger px-4 py-2 rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../api/client';

export default function Dashboard() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  const filteredRaces = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    const byName = races.filter(race =>
      lowerSearch
        ? race.name.toLowerCase().includes(lowerSearch)
        : true
    );

    return byName.sort((a, b) => {
      if (sortBy === 'speed') {
        return (b.avgSpeed || 0) - (a.avgSpeed || 0);
      }

      if (sortBy === 'duration') {
        return (b.totalTime || 0) - (a.totalTime || 0);
      }

      return new Date(b.uploadDate || b.createdAt) - new Date(a.uploadDate || a.createdAt);
    });
  }, [races, search, sortBy]);

  const quickStats = useMemo(() => {
    if (races.length === 0) {
      return {
        totalRaces: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        totalHours: 0
      };
    }

    const avgSpeed = races.reduce((sum, race) => sum + (race.avgSpeed || 0), 0) / races.length;
    const maxSpeed = Math.max(...races.map(race => race.maxSpeed || 0));
    const totalHours = races.reduce((sum, race) => sum + (race.totalTime || 0), 0);

    return {
      totalRaces: races.length,
      avgSpeed: Number(avgSpeed.toFixed(2)),
      maxSpeed: Number(maxSpeed.toFixed(2)),
      totalHours: Number(totalHours.toFixed(1))
    };
  }, [races]);

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
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Race Analytics Dashboard</h1>
        <p className="text-gray-600">Track race history, quick stats, and performance trends</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500">Races</div>
          <div className="text-2xl font-bold">{quickStats.totalRaces}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500">Avg Speed</div>
          <div className="text-2xl font-bold">{quickStats.avgSpeed} km/h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500">Max Speed</div>
          <div className="text-2xl font-bold">{quickStats.maxSpeed} km/h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500">Duration</div>
          <div className="text-2xl font-bold">{quickStats.totalHours} h</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Filter races by name"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="newest">Newest first</option>
          <option value="speed">Highest avg speed</option>
          <option value="duration">Longest duration</option>
        </select>
      </div>

      {filteredRaces.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <p className="text-xl text-gray-700 mb-4">No races uploaded yet</p>
          <p className="text-gray-600 mb-6">Start by uploading your first GPX file to analyze your sailing performance.</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
            Upload Your First Race
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map(race => (
            <div key={race.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{race.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(race.uploadDate || race.createdAt).toLocaleDateString()}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-700">
                  <div>Avg {Number(race.avgSpeed || 0).toFixed(2)} km/h</div>
                  <div>Max {Number(race.maxSpeed || 0).toFixed(2)} km/h</div>
                  <div>{Number(race.totalDistance || 0).toFixed(2)} km</div>
                  <div>{Number(race.totalTime || 0).toFixed(2)} h</div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/race/${race.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-center transition"
                  >
                    View Analysis
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
