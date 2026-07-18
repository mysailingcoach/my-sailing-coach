import fetch from 'node-fetch';

/**
 * Fetch wind data for a track and attach it to each trackpoint.
 */
export async function enrichTrackpointsWithWeather(trackpoints) {
  if (!Array.isArray(trackpoints) || trackpoints.length === 0) {
    return;
  }

  try {
    // Use the middle valid point instead of the first
    const validPoints = trackpoints.filter(
      p => p && p.lat != null && p.lon != null && p.time
    );

    if (validPoints.length === 0) {
      console.log('No valid trackpoints for weather lookup');
      return;
    }

    const weatherPoint =
      validPoints[Math.floor(validPoints.length / 2)];

    const raceDate = new Date(weatherPoint.time);

    if (isNaN(raceDate)) {
      console.log('Invalid race date');
      return;
    }

    const raceDay = raceDate.toISOString().slice(0, 10);
    const todayDay = new Date().toISOString().slice(0, 10);

    const apiBase =
      raceDay >= todayDay
        ? 'https://api.open-meteo.com/v1/forecast'
        : 'https://archive-api.open-meteo.com/v1/archive';

    const url =
      `${apiBase}?latitude=${weatherPoint.lat}` +
      `&longitude=${weatherPoint.lon}` +
      `&hourly=wind_speed_10m,wind_direction_10m` +
      `&start_date=${raceDay}` +
      `&end_date=${raceDay}` +
      `&timezone=UTC`;

    console.log('Weather URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.hourly ||
      !Array.isArray(data.hourly.time) ||
      data.hourly.time.length === 0
    ) {
      console.log('No hourly weather data returned');
      return;
    }

    // Build lookup map
    const weatherByHour = new Map();

    data.hourly.time.forEach((time, index) => {
      weatherByHour.set(time, {
        speed: data.hourly.wind_speed_10m?.[index] ?? null,
        direction: data.hourly.wind_direction_10m?.[index] ?? null,
        time
      });
    });

    let attached = 0;

    for (const point of trackpoints) {
      if (!point.time) continue;

      const date = new Date(point.time);

      if (isNaN(date)) continue;

      // Matches Open-Meteo format exactly
      const hourKey = date.toISOString().slice(0, 13) + ':00';

      const weather = weatherByHour.get(hourKey);

      if (weather) {
        point.wind = weather;
        attached++;
      }
    }

    console.log(
      `Weather attached to ${attached}/${trackpoints.length} trackpoints`
    );

    if (attached === 0) {
      console.warn(
        'No weather matched any trackpoints. This usually indicates a timezone mismatch.'
      );

      console.log(
        'Example GPX hour:',
        new Date(trackpoints[0].time).toISOString().slice(0, 13) + ':00'
      );

      console.log(
        'First weather hour:',
        data.hourly.time[0]
      );
    }

    if (trackpoints[0]?.wind) {
      console.log('Sample wind:', trackpoints[0].wind);
    }
  } catch (error) {
    console.error('Weather enrichment failed:', error);
  }
}
