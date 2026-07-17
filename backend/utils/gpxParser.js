import { promises as fs } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { enrichTrackpointsWithWeather } from './weather.js';

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

    // Compute headings and speed
    computeHeadingsAndSOG(trackpoints);

    // Weather enrichment
    if (
      process.env.ENABLE_WEATHER === 'true' &&
      trackpoints.length > 0
    ) {
      console.log('Starting weather enrichment...');

      try {
        await enrichTrackpointsWithWeather(trackpoints);

        console.log(
          'Weather attached:',
          trackpoints.filter(p => p.wind).length,
          'points'
        );

        if (trackpoints[0]?.wind) {
          console.log('First wind sample:', trackpoints[0].wind);
        }
      } catch (err) {
        console.error('Weather enrichment failed:', err);
      }
    }

    // VMG analysis
    const vmgTacks = computeVMGAndTacks(trackpoints);

    // Race analysis
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

  const trkseg = Array.isArray(trk)
    ? trk[0]?.trkseg
    : trk?.trkseg;

  const trkpts = Array.isArray(trkseg)
    ? trkseg[0]?.trkpt
    : trkseg?.trkpt;

  if (!trkpts) {
    console.log('No trackpoints found');
    return trackpoints;
  }

  const points = Array.isArray(trkpts)
    ? trkpts
    : [trkpts];

  points.forEach((pt, idx) => {
    const lat = Number(pt?.['@_lat']);
    const lon = Number(pt?.['@_lon']);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    trackpoints.push({
      lat,
      lon,
      time: pt?.time || null,
      ele: Number(pt?.ele || 0),
      index: idx
    });
  });

  return trackpoints;
}

function extractMarks(gpxData) {
  const marks = [];
  const wpts = gpxData.gpx?.wpt || gpxData.gpx?.wptpt || null;

  if (!wpts) return marks;

  const points = Array.isArray(wpts) ? wpts : [wpts];

  points.forEach(pt => {
    marks.push({
      lat: parseFloat(pt['@_lat'] || pt.lat),
      lon: parseFloat(pt['@_lon'] || pt.lon),
      name: pt.name || pt['@_name'] || pt.desc || 'Mark',
      desc: pt.desc || ''
    });
  });

  return marks;
}

// Compute heading (bearing) and speed over ground (SOG) per point
function computeHeadingsAndSOG(trackpoints) {
  if (!trackpoints || trackpoints.length < 2) return;

  for (let i = 0; i < trackpoints.length; i++) {
    const curr = trackpoints[i];
    const next = trackpoints[i + 1];
    const prev = trackpoints[i - 1];

    // heading: use next point when available, otherwise use previous
    if (next) {
      curr.heading = calculateBearing(curr.lat, curr.lon, next.lat, next.lon);
    } else if (prev) {
      curr.heading = calculateBearing(prev.lat, prev.lon, curr.lat, curr.lon);
    } else {
      curr.heading = null;
    }

    // SOG: compute speed from prev -> curr (km/h)
    if (prev && curr.time && prev.time) {
      const dist = calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon); // km
      const t0 = new Date(prev.time);
      const t1 = new Date(curr.time);
      const hours = (t1 - t0) / 1000 / 3600;
      if (hours > 0) {
        curr.sog = parseFloat((dist / hours).toFixed(2));
      } else {
        curr.sog = 0;
      }
    } else {
      curr.sog = 0;
    }
  }
}

// bearing in degrees 0-360 from point A to B
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = v => v * Math.PI / 180;
  const toDeg = v => v * 180 / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  θ = toDeg(θ);
  return (θ + 360) % 360;
}

function analyzeRace(trackpoints) {
  if (trackpoints.length < 2) {
    return { error: 'Not enough data points' };
  }

  let totalDistance = 0;
  let totalTime = 0;
  let minSpeed = Infinity;
  let maxSpeed = 0;
  let speeds = [];

  // Calculate distances and speeds
  for (let i = 1; i < trackpoints.length; i++) {
    const prev = trackpoints[i - 1];
    const curr = trackpoints[i];
    
    const distance = calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    totalDistance += distance;
    
    if (prev.time && curr.time) {
      const prevTime = new Date(prev.time);
      const currTime = new Date(curr.time);
      const timeDiff = (currTime - prevTime) / 1000 / 3600; // hours
      
      if (timeDiff > 0) {
        const speed = distance / timeDiff; // km/h
        speeds.push(speed);
        minSpeed = Math.min(minSpeed, speed);
        maxSpeed = Math.max(maxSpeed, speed);
        totalTime += timeDiff;
      }
    }
  }

  const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

  return {
    totalDistance: parseFloat(totalDistance.toFixed(2)), // km
    totalTime: parseFloat(totalTime.toFixed(2)), // hours
    avgSpeed: parseFloat(avgSpeed.toFixed(2)), // km/h
    maxSpeed: parseFloat(maxSpeed.toFixed(2)),
    minSpeed: minSpeed === Infinity ? 0 : parseFloat(minSpeed.toFixed(2)),
    pointCount: trackpoints.length,
    startTime: trackpoints[0]?.time,
    endTime: trackpoints[trackpoints.length - 1]?.time
  };
}

function computeVMGAndTacks(trackpoints) {
  if (!trackpoints || trackpoints.length < 2) return null;

  const vmgSeries = [];
  const tacks = [];

  for (let i = 0; i < trackpoints.length; i++) {
    const p = trackpoints[i];
    if (p && typeof p.heading === 'number' && p.wind && typeof p.wind.direction === 'number') {
      const angle = Math.abs(((p.heading - p.wind.direction + 540) % 360) - 180); // angle between heading and wind (0-180)
      const angleRad = (angle * Math.PI) / 180;
      const vmg = (p.sog || 0) * Math.cos(angleRad);
      vmgSeries.push({ index: i, time: p.time, vmg: parseFloat(vmg.toFixed(2)) });
    }
  }

  // simple tack/gybe detection: large heading change within short window
  for (let i = 1; i < trackpoints.length; i++) {
    const prev = trackpoints[i - 1];
    const curr = trackpoints[i];
    if (prev && curr && typeof prev.heading === 'number' && typeof curr.heading === 'number') {
      let dh = Math.abs(curr.heading - prev.heading);
      if (dh > 180) dh = 360 - dh;
      if (dh > 60) {
        const type = (curr.heading - prev.heading + 360) % 360 > 180 ? 'tack' : 'gybe';
        tacks.push({ index: i, time: curr.time, change: parseFloat(dh.toFixed(1)), type });
      }
    }
  }

  const avgVMG = vmgSeries.length > 0 ? parseFloat((vmgSeries.reduce((s, v) => s + v.vmg, 0) / vmgSeries.length).toFixed(2)) : 0;

  return { vmgSeries, avgVMG, tacks };
}

function extractMetadata(gpxData) {
  const metadata = gpxData.gpx?.metadata || {};
  return {
    creator: metadata.creator || 'Unknown',
    time: metadata.time,
    name: metadata.name || 'Untitled Race'
  };
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export { calculateDistance };
