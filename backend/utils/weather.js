import fetch from 'node-fetch';

export async function enrichTrackpointsWithWeather(trackpoints) {
  if (!trackpoints?.length) return;

  // Find center of race area
  const avgLat =
    trackpoints.reduce((sum, p) => sum + p.lat, 0) /
    trackpoints.length;

  const avgLon =
    trackpoints.reduce((sum, p) => sum + p.lon, 0) /
    trackpoints.length;

  // Race date
  const raceDate = new Date(trackpoints[0].time)
    .toISOString()
    .split('T')[0];

  const url =
    `https://archive-api.open-meteo.com/v1/archive` +
    `?latitude=${avgLat}` +
    `&longitude=${avgLon}` +
    `&start_date=${raceDate}` +
    `&end_date=${raceDate}` +
    `&hourly=wind_speed_10m,wind_direction_10m` +
    `&timezone=UTC`;

  console.log('Fetching weather:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Weather API error ${response.status}`
    );
  }

  const data = await response.json();

  const hourlyTimes = data.hourly?.time || [];
  const windSpeeds = data.hourly?.wind_speed_10m || [];
  const windDirections =
    data.hourly?.wind_direction_10m || [];

  if (!hourlyTimes.length) {
    console.log('No weather data returned');
    return;
  }

  // Convert hourly timestamps once
  const hourlyTimestamps = hourlyTimes.map(
    t => new Date(t).getTime()
  );

  // Match every trackpoint to nearest hour
  trackpoints.forEach(point => {
    const pointTime = new Date(point.time).getTime();

    let nearestIndex = 0;
    let smallestDiff = Infinity;

    for (let i = 0; i < hourlyTimestamps.length; i++) {
      const diff = Math.abs(
        pointTime - hourlyTimestamps[i]
      );

      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearestIndex = i;
      }
    }

    point.wind = {
      speed: windSpeeds[nearestIndex] ?? null,
      direction:
        windDirections[nearestIndex] ?? null,
      time: hourlyTimes[nearestIndex]
    };
  });

  console.log(
    `Weather attached to ${trackpoints.length} trackpoints`
  );
}
