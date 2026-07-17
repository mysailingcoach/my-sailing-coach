import fetch from 'node-fetch';

/**
 * Fetch wind data for all trackpoints using a single API request.
 */
export async function enrichTrackpointsWithWeather(trackpoints) {
  if (!trackpoints || trackpoints.length === 0) {
    return;
  }

  try {
    const firstPoint = trackpoints.find(
      pt =>
        pt &&
        pt.lat != null &&
        pt.lon != null &&
        pt.time
    );

    if (!firstPoint) {
      console.log('No valid trackpoints for weather lookup');
      return;
    }

    const raceDate = new Date(firstPoint.time);
    const today = new Date();

    const day = raceDate.toISOString().split('T')[0];

    const apiBase =
      raceDate > today
        ? 'https://api.open-meteo.com/v1/forecast'
        : 'https://archive-api.open-meteo.com/v1/archive';

    const url =
      `${apiBase}?latitude=${firstPoint.lat}` +
      `&longitude=${firstPoint.lon}` +
      `&hourly=wind_speed_10m,wind_direction_10m` +
      `&start_date=${day}` +
      `&end_date=${day}` +
      `&timezone=UTC`;

    console.log('Weather URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error ${response.status}`);
    }

    const data = await response.json();

    console.log(
      'Weather API returned',
      data?.hourly?.time?.length || 0,
      'hourly records'
    );

    if (
      !data.hourly ||
      !data.hourly.time ||
      data.hourly.time.length === 0
    ) {
      console.log('No weather data returned');
      return;
    }

    const weatherByHour = {};

    data.hourly.time.forEach((time, index) => {
      weatherByHour[time] = {
        speed: data.hourly.wind_speed_10m?.[index] ?? null,
        direction: data.hourly.wind_direction_10m?.[index] ?? null,
        time
      };
    });

    let attached = 0;

    trackpoints.forEach(point => {
      if (!point.time) return;

      const pointDate = new Date(point.time);

      const hourKey =
        pointDate.getUTCFullYear() +
        '-' +
        String(pointDate.getUTCMonth() + 1).padStart(2, '0') +
        '-' +
        String(pointDate.getUTCDate()).padStart(2, '0') +
        'T' +
        String(pointDate.getUTCHours()).padStart(2, '0') +
        ':00';

      const weather = weatherByHour[hourKey];

      if (weather) {
        point.wind = weather;
        attached++;
      }
    });

    console.log(
      `Weather attached to ${attached} of ${trackpoints.length} trackpoints`
    );

    if (trackpoints[0]?.wind) {
      console.log('Sample wind:', trackpoints[0].wind);
    }
  } catch (error) {
    console.error('Weather enrichment failed:', error);
  }
}
