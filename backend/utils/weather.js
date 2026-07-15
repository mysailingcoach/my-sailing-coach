import fetch from 'node-fetch';

// Simple prototype: fetch hourly windspeed and direction from Open-Meteo
// Returns nearest hourly wind data for the provided ISO timestamp (UTC)
export async function fetchWindAt(lat, lon, isoTime) {
  try {
    const date = new Date(isoTime);
    const day = date.toISOString().slice(0, 10);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=windspeed_10m,winddirection_10m&start_date=${day}&end_date=${day}&timezone=UTC`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error ${res.status}`);
    const data = await res.json();

    const times = data.hourly.time || [];
    const speeds = data.hourly.windspeed_10m || [];
    const dirs = data.hourly.winddirection_10m || [];

    if (!times.length) return null;

    // find nearest index
    let idx = 0;
    const target = date.getTime();
    let bestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]).getTime();
      const diff = Math.abs(t - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        idx = i;
      }
    }

    return {
      time: times[idx],
      windspeed: speeds[idx],
      winddirection: dirs[idx]
    };
  } catch (err) {
    return null;
  }
}
