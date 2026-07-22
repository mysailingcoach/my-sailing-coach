import { calculateDistance } from '../gpxParser.js';

export function segmentLegsByMarks(trackpoints, marks) {
  const legs = [];

  if (marks && marks.length >= 2) {
    const markIdx = marks.map(m => {
      let best = 0;
      let bestD = Infinity;

      for (let i = 0; i < trackpoints.length; i++) {
        const p = trackpoints[i];

        const d = calculateDistance(
          p.lat,
          p.lon,
          m.lat,
          m.lon
        );

        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }

      return best;
    });

    for (let i = 0; i < markIdx.length - 1; i++) {
      legs.push({
        start: markIdx[i],
        end: markIdx[i + 1]
      });
    }
  } else {
    const n = 4;
    const step = Math.floor(trackpoints.length / n);

    for (let i = 0; i < n; i++) {
      legs.push({
        start: i * step,
        end:
          i === n - 1
            ? trackpoints.length - 1
            : (i + 1) * step - 1
      });
    }
  }

  return legs;
}
