import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../api/client';

export default function Home() {
  const [file, setFile] = useState(null);
  const [raceName, setRaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-900 text-white p-10 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 opacity-10 text-[250px]">
          ⛵
        </div>

        <div className="relative max-w-4xl">
          <div className="inline-block bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
            Sailing Performance Analytics
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Turn Every Race Into
            <span className="block text-cyan-300">
              Actionable Insights
            </span>
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
            Upload your GPX track and instantly analyze speed,
            distance, route efficiency, race duration, and
            performance trends. Designed for sailors who want
            to improve with data.
          </p>

          <div className="flex flex-wrap gap-6 mt-10 text-sm">
            <div>✓ Interactive Maps</div>
            <div>✓ Speed Analysis</div>
            <div>✓ Performance Metrics</div>
            <div>✓ Unlimited Uploads</div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8 mt-10">
        {/* MAIN UPLOAD CARD */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Upload Your Race
            </h2>

            <p className="text-slate-500 mb-8">
              Import a GPX file from your watch, chart plotter,
              phone, or sailing app.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Race Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Race Name
                </label>

                <input
                  type="text"
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                  placeholder="Wednesday Night Series"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-200"
                />
              </div>

              {/* Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  GPX File
                </label>

                <div className="border-2 border-dashed border-sky-300 bg-sky-50 rounded-2xl p-12 text-center hover:border-sky-500 transition">
                  <input
                    type="file"
                    accept=".gpx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />

                  <label
                    htmlFor="file-input"
                    className="cursor-pointer block"
                  >
                    <div className="text-6xl mb-4">
                      ⛵
                    </div>

                    <p className="font-semibold text-slate-800 text-lg">
                      {file
                        ? file.name
                        : 'Choose a GPX file'}
                    </p>

                    <p className="text-slate-500 mt-2">
                      Click to browse files
                    </p>
                  </label>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
                  Race uploaded successfully. Opening analysis...
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading
                  ? 'Processing Race Data...'
                  : 'Analyze Race'}
              </button>
            </form>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-5">
              What You'll Get
            </h3>

            <div className="space-y-4">
              <div>
                <div className="font-semibold">
                  📍 Interactive Route Map
                </div>
                <div className="text-sm text-slate-500">
                  Visualize your complete track.
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  ⚡ Speed Analysis
                </div>
                <div className="text-sm text-slate-500">
                  Average, peak and segment speeds.
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
                  ⏱ Race Duration
                </div>
                <div className="text-sm text-slate-500">
                  Timing and session statistics.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-3">
              About GPX Files
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              GPX files contain GPS track data recorded by
              watches, phones, sailing instruments and chart
              plotters. Upload a GPX file to generate a
              complete analysis of your race performance.
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6">
            <div className="text-3xl font-bold">
              100%
            </div>

            <div className="text-slate-300 mt-2">
              Free race analysis for sailors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
