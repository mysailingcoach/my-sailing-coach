import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RaceMap from '../components/RaceMap';
import PerformanceMetrics from '../components/PerformanceMetrics';
import { getApiUrl } from '../api/client';
import {
  buildManeuverListLabel
} from '../utils/maneuverFormatters';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'metrics', label: 'Advanced Metrics' },
  { key: 'video', label: 'Video Sync' },
  { key: 'trends', label: 'Performance Trends' }
];

export default function RaceDetail() {
  const { id } = useParams();

  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoOffset, setVideoOffset] = useState(0);
  const [savingVideo, setSavingVideo] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    const fetchRace = async () => {
      try {
        const response = await axios.get(getApiUrl(`/races/${id}`));

        setRace(response.data);
        setVideoUrl(response.data?.data?.video?.url || '');
        setVideoOffset(response.data?.data?.video?.offsetSeconds || 0);
      } catch (err) {
        setError('Failed to load race data');
      } finally {
        setLoading(false);
      }
    };

    fetchRace();
  }, [id]);

  const handleSaveVideo = async () => {
    setSavingVideo(true);

    try {
      const response = await axios.patch(
        getApiUrl(`/races/${id}/video`),
        {
          url: videoUrl,
          offsetSeconds: Number(videoOffset) || 0,
          annotations: race?.data?.video?.annotations || []
        }
      );

      setRace(prev => ({
        ...prev,
        data: {
          ...(prev?.data || {}),
          video: response.data.video
        }
      }));
    } catch (saveError) {
      setError('Failed to save video metadata');
    } finally {
      setSavingVideo(false);
    }
  };

  const jumpToMoment = (timeValue) => {
    const sourceTime = new Date(timeValue).getTime();
    const raceStart = new Date(race?.data?.analysis?.startTime).getTime();

    if (!Number.isFinite(sourceTime) || !Number.isFinite(raceStart)) {
      return;
    }

    const secondsFromStart = Math.max(
      0,
      (sourceTime - raceStart) / 1000 + (Number(videoOffset) || 0)
    );

    if (videoRef.current) {
      videoRef.current.currentTime = secondsFromStart;
      videoRef.current.play().catch(playError => {
        console.warn(
          'Video autoplay failed:',
          playError?.message || playError
        );
      });
    }
  };

  const trendBars = useMemo(() => {
    const trend = race?.comparative?.trend || [];

    const max = Math.max(
      1,
      ...trend.map(item => item.avgSpeed || 0)
    );

    return trend.map(item => ({
      ...item,
      width: Math.max(8, ((item.avgSpeed || 0) / max) * 100)
    }));
  }, [race]);

  const safeVideoUrl = useMemo(() => {
    if (!videoUrl) {
      return '';
    }

    try {
      const parsed = new URL(videoUrl);
      const isHttp =
        parsed.protocol === 'http:' ||
        parsed.protocol === 'https:';

      return isHttp ? parsed.toString() : '';
    } catch (urlError) {
      return '';
    }
  }, [videoUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-black">
            Loading race data...
          </p>
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

  const data = race.data || {};

  const safeNumber = (value, decimals) => {
    return value != null && !isNaN(value)
      ? Number(value).toFixed(decimals)
      : 'N/A';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          {race.name}
        </h1>

        <p className="text-black">
          Uploaded:{' '}
          {race.uploadDate
            ? `${new Date(race.uploadDate).toLocaleDateString()} at ${new Date(race.uploadDate).toLocaleTimeString()}`
            : 'N/A'}
        </p>

        <div className="mt-6 border-b flex flex-wrap gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {(activeTab === 'overview' || activeTab === 'metrics') && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <RaceMap
            trackpoints={data.trackpoints || []}
            marks={data.marks || []}
            maneuvers={data.analysis?.maneuvers || []}
          />
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-black">
            Route Details
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-black">
  <thead className="bg-gray-100 text-black">
    <tr>
      <th className="px-4 py-2 text-left">Point #</th>
      <th className="px-4 py-2 text-left">Latitude</th>
      <th className="px-4 py-2 text-left">Longitude</th>
      <th className="px-4 py-2 text-left">SOG</th>
      <th className="px-4 py-2 text-left">Heading</th>
      <th className="px-4 py-2 text-left">Time</th>
    </tr>
  </thead>
              <tbody>
                {(data.trackpoints || [])
                  .slice(0, 50)
                  .map((point, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        {(point.index ?? idx) + 1}
                      </td>

                      <td className="px-4 py-2">
                        {safeNumber(point.lat, 6)}
                      </td>

                      <td className="px-4 py-2">
                        {safeNumber(point.lon, 6)}
                      </td>

                      <td className="px-4 py-2">
                        {safeNumber(point.sog, 2)}
                      </td>

                      <td className="px-4 py-2">
                        {safeNumber(point.heading, 1)}
                      </td>

                      <td className="px-4 py-2 text-xs text-black">
  {point.time ? new Date(point.time).toLocaleTimeString() : 'N/A'}
</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {(data.trackpoints || []).length > 50 && (
              <p className="text-sm text-black p-4">
                Showing 50 of{' '}
                {data.trackpoints.length} points
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <PerformanceMetrics
          analysis={data.analysis}
          comparative={race.comparative}
        />
      )}

      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              Video Synchronization
            </h2>
            <p className="text-sm text-black mb-4">
              Attach a race video URL, set a sync offset, and jump directly to maneuver moments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../race-video.mp4"
                className="md:col-span-2 border rounded px-3 py-2"
              />
              <input
                type="number"
                value={videoOffset}
                onChange={(e) => setVideoOffset(e.target.value)}
                placeholder="Offset seconds"
                className="border rounded px-3 py-2"
              />
            </div>

            <button
              onClick={handleSaveVideo}
              disabled={savingVideo}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
            >
              {savingVideo ? 'Saving...' : 'Save Video Metadata'}
            </button>
          </div>

          {safeVideoUrl ? (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <video
                ref={videoRef}
                controls
                src={safeVideoUrl}
                className="w-full rounded-lg"
                aria-label="Sailing race video playback"
              />
              <div>
                <h3 className="font-bold text-black mb-2">Maneuver Jump List</h3>
                <div className="space-y-2">
                  {(data.analysis?.maneuvers || []).slice(0, 20).map((maneuver, idx) => (
                    <button
                      key={`${maneuver.index}-${idx}`}
                      onClick={() => jumpToMoment(maneuver.time)}
                      className="w-full text-left border rounded px-3 py-2 hover:bg-blue-50"
                    >
                      {buildManeuverListLabel(maneuver)}
                      {' • '}
                      {maneuver.time ? new Date(maneuver.time).toLocaleTimeString() : 'N/A'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800">
              Add a valid http/https video URL to enable synchronized playback.
            </div>
          )}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-5">
          <h2 className="text-2xl font-bold text-black">Performance Trends</h2>

          {trendBars.length === 0 ? (
            <p className="text-sm text-black">
              Upload additional races to populate historical trend analysis.
            </p>
          ) : (
            <div className="space-y-3">
              {trendBars.map(item => (
                <div key={item.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-black">{item.name}</span>
                    <span className="text-black">{safeNumber(item.avgSpeed, 2)} km/h</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded">
                    <div
                      className="h-3 bg-blue-600 rounded"
                      style={{ width: `${item.width}%` }}
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.width)}
                      />
                    </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 text-sm text-black">
            <div>Best segment: {race.comparative?.personalBestSegment?.type || 'N/A'} ({safeNumber(race.comparative?.personalBestSegment?.avgSpeed, 2)} km/h)</div>
            <div>Worst segment: {race.comparative?.personalWorstSegment?.type || 'N/A'} ({safeNumber(race.comparative?.personalWorstSegment?.avgSpeed, 2)} km/h)</div>
          </div>
        </div>
      )}
    </div>
  );
}
