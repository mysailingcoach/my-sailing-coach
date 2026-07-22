import { calculateDistance } from '../gpxParser.js';

export function calculateLegMetrics(
  trackpoints,
  legs
) {
  const legStats = [];

  for (const leg of legs) {
    let dist = 0;
    let speeds = [];

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

      dist += segmentDistance;

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
            (a, b) => a + b,
            0
          ) / speeds.length
        : 0;

    legStats.push({
      start: leg.start,
      end: leg.end,
      distance: Number(
        dist.toFixed(2)
      ),
      avgSpeed: Number(
        avgSpeed.toFixed(2)
      )
    });
  }

  return legStats;
}
