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
