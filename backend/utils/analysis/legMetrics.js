import { calculateDistance } from '../gpxParser.js';

function calculateEfficiency(
  actualDistance,
  directDistance
) {
  if (!actualDistance) {
    return 0;
  }

  return directDistance / actualDistance;
}

export function calculateLegMetrics(
  trackpoints,
  legs
) {
  const legStats = [];

  for (const leg of legs) {
    let distance = 0;
    const speeds = [];

    for (
      let i = leg.start + 1;
      i <= leg.end;
      i++
    ) {
      const prev = trackpoints[i - 1];
      const curr = trackpoints[i];

      const segmentDistance =
        calculateDistance(
          prev.lat,
          prev.lon,
          curr.lat,
          curr.lon
        );

      distance += segmentDistance;

      if (prev.time && curr.time) {
        const dt =
          (new Date(curr.time) -
            new Date(prev.time)) /
          1000 /
          3600;

        if (dt > 0) {
          speeds.push(
            segmentDistance / dt
          );
        }
      }
    }

    const avgSpeed =
      speeds.length > 0
        ? speeds.reduce(
            (sum, speed) => sum + speed,
            0
          ) / speeds.length
        : 0;

    const maxSpeed =
      speeds.length > 0
        ? Math.max(...speeds)
        : 0;

    const startPoint =
      trackpoints[leg.start];

    const endPoint =
      trackpoints[leg.end];

    const directDistance =
      calculateDistance(
        startPoint.lat,
        startPoint.lon,
        endPoint.lat,
        endPoint.lon
      );

    const efficiency =
      calculateEfficiency(
        distance,
        directDistance
      );

    legStats.push({
      start: leg.start,
      end: leg.end,

      distance: Number(
        distance.toFixed(2)
      ),

      directDistance: Number(
        directDistance.toFixed(2)
      ),

      efficiency: Number(
        (efficiency * 100).toFixed(1)
      ),

      avgSpeed: Number(
        avgSpeed.toFixed(2)
      ),

      maxSpeed: Number(
        maxSpeed.toFixed(2)
      )
    });
  }

  return legStats;
}