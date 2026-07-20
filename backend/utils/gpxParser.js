import { XMLParser } from 'fast-xml-parser';

const MIN_TRACKPOINTS_FOR_LEG_DETECTION = 5;
const MIN_LEG_POINTS = 6;
const MANEUVER_WINDOW = 5;
const MANEUVER_COOLDOWN_POINTS = 12;
const MIN_MANEUVER_TURN_ANGLE = 70;
const GYBE_TURN_THRESHOLD = 140;
const START_LINE_LOOKAHEAD_POINTS = 5;
const HEADING_CONSISTENCY_TARGET = 80;

export function parseGPXContent(data) {
  try {
    if (
      typeof data !== 'string' ||
      data.trim().length === 0
    ) {
      throw new Error('Invalid GPX content');
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });

    const gpxData = parser.parse(data);

    const trackpoints = extractTrackpoints(gpxData);

    computeHeadingsAndSOG(trackpoints);

    const marks = extractMarks(gpxData);

    const analysis = analyzeRace(trackpoints);

    const advanced = computeAdvancedAnalysis(
      trackpoints,
      marks,
      analysis
    );

    return {
      trackpoints,
      analysis: advanced,
      marks,
      metadata: extractMetadata(gpxData)
    };
  } catch (error) {
    console.error('Error parsing GPX file:', error);
    throw error;
  }
}

export function computeAdvancedAnalysis(
  trackpoints,
  marks = [],
  baseAnalysis = null
) {
  const analysis = baseAnalysis || analyzeRace(trackpoints);

  const legs = detectLegs(trackpoints);
  const maneuvers = detectManeuvers(trackpoints);
  const advancedMetrics = computeAdvancedMetrics(trackpoints);
  const startLine = computeStartLineAnalysis(trackpoints, marks);

  const bestLeg =
    legs.length > 0
      ? [...legs].sort(
          (a, b) => b.avgSpeed - a.avgSpeed
        )[0]
      : null;

  const worstLeg =
    legs.length > 0
      ? [...legs].sort(
          (a, b) => a.avgSpeed - b.avgSpeed
        )[0]
      : null;

  return {
    ...analysis,
    ...advancedMetrics,
    legs,
    legSummary: {
      count: legs.length,
      upwind: legs.filter(l => l.type === 'Upwind').length,
      downwind: legs.filter(l => l.type === 'Downwind').length,
      reaching: legs.filter(l => l.type === 'Reaching').length,
      unknown: legs.filter(l => l.type === 'Unknown').length,
      bestLeg,
      worstLeg
    },
    maneuvers,
    maneuverSummary: {
      total: maneuvers.length,
      tacks: maneuvers.filter(m => m.type === 'Tack').length,
      gybes: maneuvers.filter(m => m.type === 'Gybe').length,
      avgEfficiency:
        maneuvers.length > 0
          ? Number(
              (
                maneuvers.reduce(
                  (sum, maneuver) =>
                    sum + maneuver.efficiencyScore,
                  0
                ) / maneuvers.length
              ).toFixed(2)
            )
          : 0
    },
    startLine,
    report: buildAutomatedReport({
      analysis,
      advancedMetrics,
      legs,
      maneuvers,
      startLine
    }),
    generatedAt: new Date().toISOString()
  };
}

function extractTrackpoints(gpxData) {
  const trackpoints = [];

  const trk = gpxData?.gpx?.trk;

  if (!trk) {
    return trackpoints;
  }

  const tracks = Array.isArray(trk) ? trk : [trk];

  tracks.forEach(track => {
    const segments = Array.isArray(track.trkseg)
      ? track.trkseg
      : [track.trkseg];

    segments
      .filter(Boolean)
      .forEach(segment => {
        const points = Array.isArray(segment.trkpt)
          ? segment.trkpt
          : [segment.trkpt];

        points
          .filter(Boolean)
          .forEach(pt => {
            const lat = Number(pt['@_lat']);
            const lon = Number(pt['@_lon']);

            if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
              return;
            }

            const ext = pt.extensions || {};
            const windSpeed =
              readNumericExtension(ext, [
                ['wind', 'speed'],
                ['windSpeed'],
                ['windspeed'],
                ['wind_speed'],
                ['gpxtpx', 'wspd'],
                ['TrackPointExtension', 'wspd']
              ]) ?? null;

            const windDirection =
              readNumericExtension(ext, [
                ['wind', 'direction'],
                ['windDirection'],
                ['winddirection'],
                ['wind_dir'],
                ['gpxtpx', 'wdir'],
                ['TrackPointExtension', 'wdir']
              ]) ?? null;

            trackpoints.push({
              lat,
              lon,
              time: pt.time || null,
              ele: Number(pt.ele || 0),
              index: trackpoints.length,
              heading: null,
              sog: 0,
              wind:
                windSpeed != null || windDirection != null
                  ? {
                      speed: windSpeed,
                      direction:
                        windDirection != null
                          ? normalizeAngle(windDirection)
                          : null,
                      source: 'gpx-extension'
                    }
                  : undefined
            });
          });
      });
  });

  return trackpoints;
}

function readNumericExtension(root, paths) {
  for (const path of paths) {
    let current = root;

    for (const segment of path) {
      if (current == null) {
        current = null;
        break;
      }

      current = current[segment];
    }

    if (current == null) {
      continue;
    }

    const numeric = Number(current);

    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return null;
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

    curr.heading = next
      ? calculateBearing(
          curr.lat,
          curr.lon,
          next.lat,
          next.lon
        )
      : null;

    curr.sog = 0;

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

function detectLegs(trackpoints) {
  if (
    !Array.isArray(trackpoints) ||
    trackpoints.length < MIN_TRACKPOINTS_FOR_LEG_DETECTION
  ) {
    return [];
  }

  const classified = trackpoints.map((point, index) => {
    const twa = computeTWA(point);

    let type = 'Unknown';

    if (twa != null) {
      if (twa <= 60) {
        type = 'Upwind';
      } else if (twa >= 120) {
        type = 'Downwind';
      } else {
        type = 'Reaching';
      }
    }

    return {
      index,
      type,
      twa
    };
  });

  const legs = [];
  let current = {
    type: classified[0].type,
    start: 0
  };

  for (let i = 1; i < classified.length; i++) {
    if (classified[i].type !== current.type) {
      if (i - current.start >= MIN_LEG_POINTS) {
        legs.push(
          buildLegStats(
            trackpoints,
            current.start,
            i - 1,
            current.type
          )
        );
      }

      current = {
        type: classified[i].type,
        start: i
      };
    }
  }

  if (
    classified.length - current.start >=
    MIN_LEG_POINTS
  ) {
    legs.push(
      buildLegStats(
        trackpoints,
        current.start,
        classified.length - 1,
        current.type
      )
    );
  }

  if (legs.length === 0) {
    return [
      buildLegStats(
        trackpoints,
        0,
        trackpoints.length - 1,
        'Unknown'
      )
    ];
  }

  return legs;
}

function buildLegStats(trackpoints, start, end, type) {
  let distance = 0;
  const speeds = [];

  for (let i = start + 1; i <= end; i++) {
    const prev = trackpoints[i - 1];
    const curr = trackpoints[i];

    distance += calculateDistance(
      prev.lat,
      prev.lon,
      curr.lat,
      curr.lon
    );

    if (Number.isFinite(curr.sog) && curr.sog > 0) {
      speeds.push(curr.sog);
    }
  }

  const startPoint = trackpoints[start];
  const endPoint = trackpoints[end];
  const durationHours =
    startPoint.time && endPoint.time
      ? (new Date(endPoint.time) - new Date(startPoint.time)) /
        3600000
      : 0;

  return {
    type,
    startIndex: start,
    endIndex: end,
    pointCount: end - start + 1,
    distance: Number(distance.toFixed(2)),
    durationHours: Number(durationHours.toFixed(2)),
    avgSpeed:
      speeds.length > 0
        ? Number(
            (
              speeds.reduce((sum, speed) => sum + speed, 0) /
              speeds.length
            ).toFixed(2)
          )
        : 0,
    maxSpeed:
      speeds.length > 0
        ? Number(Math.max(...speeds).toFixed(2))
        : 0,
    startTime: startPoint.time,
    endTime: endPoint.time
  };
}

function detectManeuvers(trackpoints) {
  if (
    !Array.isArray(trackpoints) ||
    trackpoints.length < MANEUVER_COOLDOWN_POINTS
  ) {
    return [];
  }

  const maneuvers = [];
  let lastIndex = -20;

  for (
    let i = MANEUVER_WINDOW;
    i < trackpoints.length - MANEUVER_WINDOW;
    i++
  ) {
    if (i - lastIndex < MANEUVER_COOLDOWN_POINTS) {
      continue;
    }

    const before = trackpoints[i - MANEUVER_WINDOW];
    const current = trackpoints[i];
    const after = trackpoints[i + MANEUVER_WINDOW];

    if (
      before.heading == null ||
      current.heading == null ||
      after.heading == null
    ) {
      continue;
    }

    const turnBefore = signedAngleDelta(
      before.heading,
      current.heading
    );
    const turnAfter = signedAngleDelta(
      current.heading,
      after.heading
    );

    const netTurn = Math.abs(
      signedAngleDelta(before.heading, after.heading)
    );

    if (
      Math.sign(turnBefore) === Math.sign(turnAfter) ||
      netTurn < MIN_MANEUVER_TURN_ANGLE
    ) {
      continue;
    }

    const type =
      netTurn >= GYBE_TURN_THRESHOLD
        ? 'Gybe'
        : 'Tack';
    const speedBefore = average(
      trackpoints
        .slice(i - MANEUVER_WINDOW, i)
        .map(p => p.sog || 0)
    );
    const speedAfter = average(
      trackpoints
        .slice(
          i + 1,
          i + MANEUVER_WINDOW + 1
        )
        .map(p => p.sog || 0)
    );

    const efficiencyScore =
      speedBefore > 0
        ? Number(
            Math.max(
              0,
              Math.min(1.2, speedAfter / speedBefore)
            ).toFixed(2)
          )
        : 0;

    maneuvers.push({
      type,
      index: i,
      time: current.time,
      lat: current.lat,
      lon: current.lon,
      headingChange: Number(netTurn.toFixed(1)),
      speedBefore: Number(speedBefore.toFixed(2)),
      speedAfter: Number(speedAfter.toFixed(2)),
      speedDelta: Number((speedAfter - speedBefore).toFixed(2)),
      efficiencyScore
    });

    lastIndex = i;
  }

  return maneuvers;
}

function computeAdvancedMetrics(trackpoints) {
  const vmgValues = [];
  const twaValues = [];
  const sogValues = [];
  const headingSteps = [];

  for (let i = 0; i < trackpoints.length; i++) {
    const current = trackpoints[i];

    if (Number.isFinite(current.sog) && current.sog > 0) {
      sogValues.push(current.sog);
    }

    const twa = computeTWA(current);

    if (twa != null) {
      twaValues.push(twa);

      if (Number.isFinite(current.sog)) {
        const vmg = Math.abs(
          current.sog * Math.cos((twa * Math.PI) / 180)
        );

        if (Number.isFinite(vmg)) {
          vmgValues.push(vmg);
        }
      }
    }

    const prev = trackpoints[i - 1];

    if (prev && prev.heading != null && current.heading != null) {
      headingSteps.push(
        Math.abs(
          signedAngleDelta(prev.heading, current.heading)
        )
      );
    }
  }

  const avgSog = average(sogValues);
  const maxSog = sogValues.length ? Math.max(...sogValues) : 0;
  const theoreticalMax = maxSog > 0 ? maxSog : avgSog;
  const headingVariance = standardDeviation(headingSteps);

  return {
    vmg: {
      avg: Number(average(vmgValues).toFixed(2)),
      max: Number((vmgValues.length ? Math.max(...vmgValues) : 0).toFixed(2)),
      min: Number((vmgValues.length ? Math.min(...vmgValues) : 0).toFixed(2)),
      sampleCount: vmgValues.length
    },
    twa: {
      avg: Number(average(twaValues).toFixed(1)),
      min: Number((twaValues.length ? Math.min(...twaValues) : 0).toFixed(1)),
      max: Number((twaValues.length ? Math.max(...twaValues) : 0).toFixed(1)),
      sampleCount: twaValues.length
    },
    sogVsTrueSpeed: {
      avgSog: Number(avgSog.toFixed(2)),
      estimatedTrueSpeed: Number(avgSog.toFixed(2)),
      ratio: avgSog > 0 ? 1 : 0
    },
    headingAnalysis: {
      consistencyScore: Number(
        Math.max(0, 100 - headingVariance * 2).toFixed(1)
      ),
      averageTurnRate: Number(average(headingSteps).toFixed(2)),
      headingVariance: Number(headingVariance.toFixed(2))
    },
    performanceIndex: {
      score:
        theoreticalMax > 0
          ? Number(((avgSog / theoreticalMax) * 100).toFixed(1))
          : 0,
      theoreticalMaxSpeed: Number(theoreticalMax.toFixed(2))
    }
  };
}

function computeStartLineAnalysis(trackpoints, marks) {
  if (!Array.isArray(trackpoints) || trackpoints.length < 2) {
    return {
      hasStartLine: false
    };
  }

  const line =
    marks && marks.length >= 2
      ? {
          a: marks[0],
          b: marks[1],
          source: 'marks'
        }
      : {
          a: trackpoints[0],
          b: trackpoints[
            Math.min(
              trackpoints.length - 1,
              START_LINE_LOOKAHEAD_POINTS
            )
          ],
          source: 'derived'
        };

  let crossing = null;

  for (let i = 1; i < trackpoints.length; i++) {
    const p1 = trackpoints[i - 1];
    const p2 = trackpoints[i];

    if (
      intersects(
        line.a.lon,
        line.a.lat,
        line.b.lon,
        line.b.lat,
        p1.lon,
        p1.lat,
        p2.lon,
        p2.lat
      )
    ) {
      crossing = {
        index: i,
        point: p2
      };
      break;
    }
  }

  const approachWindow = trackpoints.slice(0, Math.min(trackpoints.length, 25));
  const approachSpeeds = approachWindow
    .map(point => point.sog)
    .filter(speed => Number.isFinite(speed) && speed > 0);

  return {
    hasStartLine: true,
    lineSource: line.source,
    crossingIndex: crossing?.index ?? null,
    crossingTime: crossing?.point?.time ?? null,
    crossingSpeed: Number((crossing?.point?.sog || 0).toFixed(2)),
    avgApproachSpeed: Number(average(approachSpeeds).toFixed(2)),
    startTimingScore: Number(
      Math.max(
        0,
        Math.min(
          100,
          ((crossing?.point?.sog || average(approachSpeeds)) /
            Math.max(1, average(approachSpeeds))) *
            100
        )
      ).toFixed(1)
    )
  };
}

function buildAutomatedReport({
  analysis,
  advancedMetrics,
  legs,
  maneuvers,
  startLine
}) {
  const bestLeg =
    legs.length > 0
      ? [...legs].sort((a, b) => b.avgSpeed - a.avgSpeed)[0]
      : null;

  const worstLeg =
    legs.length > 0
      ? [...legs].sort((a, b) => a.avgSpeed - b.avgSpeed)[0]
      : null;

  const recommendation =
    advancedMetrics?.headingAnalysis?.consistencyScore >=
    HEADING_CONSISTENCY_TARGET
      ? 'Maintain your current heading consistency and focus on maneuver exits.'
      : 'Improve heading consistency by reducing abrupt steering changes.';

  const maneuverEfficiencyText =
    maneuvers.length > 0
      ? `${(
          average(
            maneuvers.map(
              maneuver => maneuver.efficiencyScore
            )
          ) * 100
        ).toFixed(0)}%`
      : 'N/A';

  return {
    summary:
      `Race distance ${analysis.totalDistance} km in ${analysis.totalTime} h. ` +
      `${maneuvers.length} maneuvers detected with average efficiency ` +
      `${maneuverEfficiencyText}.`,
    weatherSummary:
      advancedMetrics?.twa?.sampleCount > 0
        ? `Average TWA ${advancedMetrics.twa.avg}° with VMG avg ${advancedMetrics.vmg.avg} km/h.`
        : 'No wind data available for TWA/VMG weather summary.',
    performanceSummary: {
      bestLeg,
      worstLeg,
      startLineScore: startLine?.startTimingScore ?? 0,
      performanceIndex: advancedMetrics?.performanceIndex?.score ?? 0
    },
    recommendations: [recommendation]
  };
}

function computeTWA(point) {
  if (
    !point ||
    point.heading == null ||
    !point.wind ||
    point.wind.direction == null
  ) {
    return null;
  }

  const diff = Math.abs(
    signedAngleDelta(point.wind.direction, point.heading)
  );

  return Number(diff.toFixed(1));
}

function signedAngleDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function normalizeAngle(angle) {
  return ((Number(angle) % 360) + 360) % 360;
}

function average(values) {
  if (!values || values.length === 0) {
    return 0;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function standardDeviation(values) {
  if (!values || values.length === 0) {
    return 0;
  }

  const mean = average(values);
  const variance = average(
    values.map(value => (value - mean) ** 2)
  );

  return Math.sqrt(variance);
}

function orientation(px, py, qx, qy, rx, ry) {
  const value =
    (qy - py) * (rx - qx) -
    (qx - px) * (ry - qy);

  if (value === 0) {
    return 0;
  }

  return value > 0 ? 1 : 2;
}

function onSegment(px, py, qx, qy, rx, ry) {
  return (
    qx <= Math.max(px, rx) &&
    qx >= Math.min(px, rx) &&
    qy <= Math.max(py, ry) &&
    qy >= Math.min(py, ry)
  );
}

function intersects(x1, y1, x2, y2, x3, y3, x4, y4) {
  const o1 = orientation(x1, y1, x2, y2, x3, y3);
  const o2 = orientation(x1, y1, x2, y2, x4, y4);
  const o3 = orientation(x3, y3, x4, y4, x1, y1);
  const o4 = orientation(x3, y3, x4, y4, x2, y2);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  if (o1 === 0 && onSegment(x1, y1, x3, y3, x2, y2)) return true;
  if (o2 === 0 && onSegment(x1, y1, x4, y4, x2, y2)) return true;
  if (o3 === 0 && onSegment(x3, y3, x1, y1, x4, y4)) return true;
  if (o4 === 0 && onSegment(x3, y3, x2, y2, x4, y4)) return true;

  return false;
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
