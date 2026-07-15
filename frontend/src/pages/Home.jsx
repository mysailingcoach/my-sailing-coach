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

      const response = await axios.post(getApiUrl('/upload'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/race/${response.data.raceId}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-12 text-white">
        <h1 className="text-4xl font-bold mb-4">Analyze Your Sailing Performance</h1>
        <p className="text-xl text-blue-100">Upload your GPX file and get detailed insights about your race including speed, distance, and performance metrics.</p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload GPX File</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Race Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Race Name</label>
              <input
                type="text"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                placeholder="e.g., Local Cup 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPX File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <input
                  type="file"
                  accept=".gpx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-gray-700 font-medium">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-gray-500 text-sm">GPX files only</p>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✓ File processed successfully! Redirecting...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? 'Processing...' : 'Analyze Race'}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📊 What You'll Get</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700"><strong>Interactive Map</strong> - View your race route</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700"><strong>Speed Analysis</strong> - Average, max, and min speeds</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700"><strong>Distance Tracking</strong> - Total distance covered</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700"><strong>Race Duration</strong> - Start time, end time, total duration</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700"><strong>Unlimited Uploads</strong> - Completely free</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-gray-800">💡 About GPX Files</h3>
            <p className="text-gray-700 text-sm">
              GPX (GPS Exchange Format) files contain GPS coordinates recorded by your device. Most GPS watches, smartphones, and sailing apps can record and export GPX files of your sailing activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
