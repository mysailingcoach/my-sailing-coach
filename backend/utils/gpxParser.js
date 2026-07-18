import { promises as fs } from 'fs';
import { XMLParser } from 'fast-xml-parser';

export async function parseGPXFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });

    const gpxData = parser.parse(data);

    const trackpoints = extractTrackpoints(gpxData);

    console.log('Trackpoints parsed:', trackpoints.length);
    console.log('First parsed point:', trackpoints[0]);

    computeHeadingsAndSOG(trackpoints);

    const vmgTacks = computeVMGAndTacks(trackpoints);

    const analysis = analyzeRace(trackpoints);

    if (vmgTacks) {
      analysis.vmg = vmgTacks;
    }

    const marks = extractMarks(gpxData);

    return {
      trackpoints,
      analysis,
      marks,
      metadata: extractMetadata(gpxData)
    };
  } catch (error) {
    console.error('Error parsing GPX file:', error);
    throw error;
  }
}

function extractTrackpoints(gpxData) {
  const trackpoints = [];

  const trk = gpxData?.gpx?.trk;

  if (!trk) {
    console.log('No tracks found in GPX');
    return trackpoints;
  }

  const track = Array.isArray(trk) ? trk[0] : trk;
  const segments = track.trkseg;
  const segment = Array.isArray(segments) ? segments[0] : segments;

  const points = segment?.trkpt;

  if (!points) {
    console.log('No trackpoints found');
    return trackpoints;
  }

  const list = Array.isArray(points) ? points : [points];

  list.forEach((pt, index) => {
    const lat = Number(pt['@_lat']);
    const lon = Number(pt['@_lon']);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    trackpoints.push({
      lat,
      lon,
      time: pt.time || null,
      ele: Number(pt.ele || 0),
      index
    });
  });

  return trackpoints;
}

function extractMarks(gpxData) {
  const marks = [];

  const wpts = gpxData.gpx?.wpt;

  if (!wpts) {
    return marks;
  }

  const points = Array.isArray(wpts) ? wpts : [wpts];

  points.forEach(pt => {
    marks.push({
      lat: Number(pt['@_lat']),
      lon: Number(pt['@_lon']),
      name: pt.name || 'Mark',
      desc: pt.desc || ''
    });
  });

  return marks;
}

function computeHeadingsAndSOG(trackpoints) {
  for (let i = 0; i < trackpoints.length; i++) {
    const curr = trackpoints[i];
    const next = trackpoints[i + 1];
    const prev = trackpoints[i - 1];

    if (next) {
      curr.heading = calculateBearing(
        curr.lat,
        curr.lon,
        next.lat,
        next.lon
      );
    }

    if (prev && curr.time && prev.time) {
      const distance = calculateDistance(
        prev.lat,
        prev.lon,
        curr.lat,
        curr.lon
      );

      const hours =
        (new Date(curr.time) - new Date(prev.time)) / 3600000;

      curr.sog =
        hours > 0
          ? Number((distance / hours).toFixed(2))
          : 0;
    }
  }
}

function analyzeRace(trackpoints) {
  if (trackpoints.length < 2) {
    return {
      error: 'Not enough data'
    };
  }

  let totalDistance = 0;

  for (let i = 1; i < trackpoints.length; i++) {
    totalDistance += calculateDistance(
      trackpoints[i - 1].lat,
      trackpoints[i - 1].lon,
      trackpoints[i].lat,
      trackpoints[i].lon
    );
  }

  const startTime = trackpoints[0]?.time;
  const endTime = trackpoints.at(-1)?.time;

  const totalTime =
    startTime && endTime
      ? (new Date(endTime) - new Date(startTime)) /
        3600000
      : 0;

  const speeds = trackpoints
    .map(p => p.sog)
    .filter(
      speed =>
        speed != null &&
        !isNaN(speed) &&
        speed > 0
    );

  const avgSpeed =
    totalTime > 0
      ? totalDistance / totalTime
      : 0;

  const maxSpeed =
    speeds.length > 0
      ? Math.max(...speeds)
      : 0;

  const minSpeed =
    speeds.length > 0
      ? Math.min(...speeds)
      : 0;

  return {
    totalDistance: Number(totalDistance.toFixed(2)),
    pointCount: trackpoints.length,
    startTime,
    endTime,
    totalTime: Number(totalTime.toFixed(2)),
    avgSpeed: Number(avgSpeed.toFixed(2)),
    maxSpeed: Number(maxSpeed.toFixed(2)),
    minSpeed: Number(minSpeed.toFixed(2))
  };
}

function computeVMGAndTacks() {
  return null;
}

function extractMetadata(gpxData) {
  return {
    creator: gpxData.gpx?.creator || 'Unknown',
    name:
      gpxData.gpx?.metadata?.name ||
      'Untitled Race'
  };
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const rad = v => (v * Math.PI) / 180;
  const deg = v => (v * 180) / Math.PI;

  const y =
    Math.sin(rad(lon2 - lon1)) *
    Math.cos(rad(lat2));

  const x =
    Math.cos(rad(lat1)) *
    Math.sin(rad(lat2)) -
    Math.sin(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.cos(rad(lon2 - lon1));

  return (deg(Math.atan2(y, x)) + 360) % 360;
}

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

export {
  calculateDistance
};
