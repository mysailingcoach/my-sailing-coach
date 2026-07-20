import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { parseGPXContent } from '../utils/gpxParser.js';

async function run() {
  // Create a minimal GPX with one track (3 points) and one waypoint
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
  <gpx version="1.1" creator="Test">
    <wpt lat="51.0" lon="0.0"><name>Mark A</name><desc>Test mark</desc></wpt>
    <trk>
      <name>Test Track</name>
      <trkseg>
        <trkpt lat="51.0" lon="0.0"><ele>5</ele><time>2023-01-01T10:00:00Z</time></trkpt>
        <trkpt lat="51.0005" lon="0.0005"><ele>5</ele><time>2023-01-01T10:01:00Z</time></trkpt>
        <trkpt lat="51.0010" lon="0.0010"><ele>5</ele><time>2023-01-01T10:02:00Z</time></trkpt>
      </trkseg>
    </trk>
  </gpx>`;

  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `test_gpx_${Date.now()}.gpx`);
  fs.writeFileSync(filePath, gpx, 'utf8');

  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const result = parseGPXContent(rawData);
    // Basic assertions
    if (!result.trackpoints || result.trackpoints.length !== 3) {
      console.error('FAIL: trackpoints length mismatch', result.trackpoints && result.trackpoints.length);
      process.exit(2);
    }

    if (!result.marks || result.marks.length === 0) {
      console.error('FAIL: no marks extracted');
      process.exit(3);
    }

    const hasHeading = result.trackpoints.every(p => typeof p.heading === 'number' || p.heading === null);
    const hasSog = result.trackpoints.every(p => typeof p.sog === 'number');

    if (!hasHeading) {
      console.error('FAIL: missing heading values');
      process.exit(4);
    }

    if (!hasSog) {
      console.error('FAIL: missing SOG values');
      process.exit(5);
    }

    if (!Array.isArray(result.analysis?.legs)) {
      console.error('FAIL: missing leg analysis');
      process.exit(6);
    }

    if (!Array.isArray(result.analysis?.maneuvers)) {
      console.error('FAIL: missing maneuver analysis');
      process.exit(7);
    }

    if (!result.analysis?.vmg || !result.analysis?.twa) {
      console.error('FAIL: missing advanced metrics');
      process.exit(8);
    }

    if (!result.analysis?.startLine) {
      console.error('FAIL: missing start line analysis');
      process.exit(9);
    }

    console.log('PASS: gpxParser basic checks');
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    try { fs.unlinkSync(filePath); } catch (e) {}
  }
}

run();
