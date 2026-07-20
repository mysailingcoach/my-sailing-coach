import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../api/client';

const features = [
  {
    icon: '📍',
    title: 'Interactive Route Map',
    desc: 'Visualize your complete track with a beautiful interactive map.',
  },
  {
    icon: '⚡',
    title: 'Speed Analysis',
    desc: 'Average, peak and segment speeds broken down lap by lap.',
  },
  {
    icon: '📏',
    title: 'Distance Metrics',
    desc: 'Total distance covered and route efficiency scores.',
  },
  {
    icon: '⏱',
    title: 'Race Duration',
    desc: 'Precise timing and session statistics at a glance.',
  },
];

export default function Home() {
  const [file, setFile] = useState(null);
  const [raceName, setRaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (selected && selected.name.endsWith('.gpx')) {
      setFile(selected);
      setError('');

      if (!raceName) {
        setRaceName(selected.name.replace('.gpx', ''));
      }
    } else {
      setError('Please select a valid GPX file');
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];

    if (dropped && dropped.name.endsWith('.gpx')) {
      setFile(dropped);
      setError('');
      if (!raceName) {
        setRaceName(dropped.name.replace('.gpx', ''));
      }
    } else {
      setError('Please drop a valid .gpx file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a GPX file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('gpx', file);
      formData.append('raceName', raceName);

      const response = await axios.post(
        getApiUrl('/upload'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(true);

      setTimeout(() => {
        navigate(`/race/${response.data.raceId}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-10 md:p-16 mb-10 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, #0d2060 0%, #0a1a50 40%, #07112e 70%, #040c1e 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 10s ease infinite, fadeIn 0.6s ease both',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Floating boat decoration */}
        <div
          className="pointer-events-none absolute top-8 right-10 text-[160px] md:text-[220px] leading-none select-none animate-float opacity-10"
        >
          ⛵
        </div>

        <div className="relative max-w-3xl">
          {/* Badge */}
          <div className="animate-slide-up mb-6 inline-flex">
            <span className="badge badge-blue">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Sailing Performance Analytics
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-slide-up-1 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6 text-white">
            Turn Every Race Into
            <span className="block gradient-text mt-1">
              Actionable Insights
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="animate-slide-up-2 text-base md:text-lg leading-relaxed mb-10" style={{ color: '#93c5fd' }}>
            Upload your GPX track and instantly analyze speed, distance,
            route efficiency, race duration, and performance trends.
            Designed for sailors who want to improve with data.
          </p>

          <div className="flex flex-wrap gap-6 mt-10 text-sm">
            <div>✓ Interactive Maps</div>
            <div>✓ Speed Analysis</div>
            <div>✓ Leg + Maneuver Analytics</div>
            <div>✓ Unlimited Uploads</div>
          </div>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Upload Card ── */}
        <div className="lg:col-span-2 animate-slide-up-2">
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h2 className="text-2xl font-bold mb-1">Upload Your Race</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
              Import a GPX file from your watch, chart plotter, phone, or sailing app.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Race Name */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Race Name
                </label>
                <input
                  type="text"
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                  placeholder="Wednesday Night Series"
                  className="input-modern"
                />
              </div>

              {/* Drop zone */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  GPX File
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className="rounded-xl p-12 text-center transition-all duration-300"
                  style={{
                    border: `2px dashed ${dragOver || file ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.12)'}`,
                    background: dragOver
                      ? 'rgba(59,130,246,0.07)'
                      : file
                        ? 'rgba(59,130,246,0.05)'
                        : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="file"
                    accept=".gpx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />

                  <label htmlFor="file-input" className="cursor-pointer block">
                    <div
                      className={`text-5xl mb-4 transition-transform duration-300 inline-block ${file ? 'animate-float' : ''}`}
                    >
                      {file ? '✅' : '⛵'}
                    </div>

                    <p className="font-semibold text-base mb-1" style={{ color: file ? '#86efac' : 'var(--color-text)' }}>
                      {file ? file.name : 'Drop your GPX file here'}
                    </p>

                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {file ? 'File ready — hit Analyze Race' : 'or click to browse'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium animate-scale-in"
                  style={{
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.25)',
                    color: 'var(--color-error)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium animate-scale-in"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    color: 'var(--color-success)',
                  }}
                >
                  Race uploaded successfully — opening analysis…
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !file}
                className="btn-gradient w-full py-4 text-base rounded-xl"
              >
                {loading && (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Processing Race Data…' : 'Analyze Race'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5 animate-slide-up-3">

          {/* What You'll Get */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="font-bold text-base mb-5">What You'll Get</h3>

              <div>
                <div className="font-semibold">
                  ⚡ Advanced Metrics
                </div>
                <div className="text-sm text-slate-500">
                  VMG, TWA, heading and performance index.
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  📏 Distance Metrics
                </div>
                <div className="text-sm text-slate-500">
                  Total distance and route efficiency.
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  🔄 Maneuver Detection
                </div>
                <div className="text-sm text-slate-500">
                  Auto-detected tacks/gybes with efficiency scoring.
                </div>
              ))}
            </div>
          </div>

          {/* About GPX */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.06) 100%)',
              border: '1px solid rgba(6,182,212,0.2)',
            }}
          >
            <h3 className="font-bold text-sm mb-2">About GPX Files</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              GPX files contain GPS track data recorded by watches, phones, sailing
              instruments and chart plotters. Upload a GPX file to generate a
              complete analysis of your race performance.
            </p>
          </div>

          {/* 100% Free badge */}
          <div
            className="rounded-2xl p-6 text-center animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #0d2060 0%, #0a1a40 100%)',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <div className="text-4xl font-extrabold gradient-text mb-1">100%</div>
            <div className="text-sm" style={{ color: '#93c5fd' }}>
              Free race analysis for sailors.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
